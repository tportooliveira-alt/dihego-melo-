"""Envio e recebimento de WhatsApp pela Evolution API.

Sem dependência externa (urllib puro). Traz as travas que protegem o número da
loja contra banimento: limite diário, cooldown por número e modo teste.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass

from . import config
from .db import banco


@dataclass
class Envio:
    enviado: bool
    # nao_configurado distingue "faltou credencial" de "tentou e falhou".
    nao_configurado: bool = False
    bloqueado_por: str | None = None
    erro: str | None = None


def normalizar_telefone(numero: str) -> str:
    """Só dígitos, com DDI 55 na frente."""
    digitos = re.sub(r"\D", "", numero or "")
    if not digitos:
        return ""
    if not digitos.startswith("55"):
        digitos = "55" + digitos
    return digitos


def telefone_valido(numero: str) -> bool:
    return len(normalizar_telefone(numero)) >= 12


def disponivel() -> bool:
    return bool(config.EVOLUTION_API_URL and config.EVOLUTION_API_KEY)


def _registrar_envio(telefone: str, finalidade: str, sucesso: bool) -> None:
    with banco() as conn:
        conn.execute(
            "INSERT INTO envios_whatsapp (telefone, finalidade, sucesso) VALUES (?,?,?)",
            (telefone, finalidade, 1 if sucesso else 0),
        )


def _travas(telefone: str, finalidade: str) -> str | None:
    """Devolve o motivo do bloqueio, ou None se pode enviar.

    O aviso ao dono escapa das travas de volume: é raro e é o que faz o
    negócio acontecer.
    """
    if finalidade == "aviso_dono":
        return None

    if config.WHATSAPP_MODO_TESTE:
        permitidos = {normalizar_telefone(n) for n in config.WHATSAPP_NUMEROS_TESTE}
        if telefone not in permitidos:
            return "modo_teste"

    with banco() as conn:
        hoje = conn.execute(
            "SELECT COUNT(*) n FROM envios_whatsapp "
            "WHERE sucesso = 1 AND finalidade = 'auto_reply' "
            "AND date(criado_em) = date('now')"
        ).fetchone()["n"]
        if hoje >= config.WHATSAPP_LIMITE_DIARIO:
            return "limite_diario"

        recente = conn.execute(
            "SELECT COUNT(*) n FROM envios_whatsapp "
            "WHERE telefone = ? AND sucesso = 1 "
            "AND criado_em > datetime('now', ?)",
            (telefone, f"-{config.WHATSAPP_COOLDOWN_SEG} seconds"),
        ).fetchone()["n"]
        if recente:
            return "cooldown"

    return None


def enviar(numero: str, texto: str, finalidade: str = "auto_reply") -> Envio:
    telefone = normalizar_telefone(numero)

    if not telefone_valido(telefone):
        return Envio(enviado=False, erro="telefone_invalido")
    if not disponivel():
        return Envio(enviado=False, nao_configurado=True)

    bloqueio = _travas(telefone, finalidade)
    if bloqueio:
        return Envio(enviado=False, bloqueado_por=bloqueio)

    url = f"{config.EVOLUTION_API_URL}/message/sendText/{config.EVOLUTION_INSTANCIA}"
    corpo = json.dumps({"number": telefone, "text": texto}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=corpo,
        headers={"Content-Type": "application/json", "apikey": config.EVOLUTION_API_KEY},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            ok = 200 <= r.status < 300
        _registrar_envio(telefone, finalidade, ok)
        return Envio(enviado=ok, erro=None if ok else "resposta_inesperada")
    except urllib.error.HTTPError as e:
        _registrar_envio(telefone, finalidade, False)
        return Envio(enviado=False, erro=f"http_{e.code}")
    except Exception as e:
        _registrar_envio(telefone, finalidade, False)
        return Envio(enviado=False, erro=type(e).__name__)


def extrair_do_webhook(payload: dict) -> dict | None:
    """Tira do payload do Evolution o que interessa. None = ignorar o evento."""
    if payload.get("event") != "messages.upsert":
        return None

    dados = payload.get("data") or {}
    chave = dados.get("key") or {}

    if chave.get("fromMe"):
        return None

    remote = chave.get("remoteJid") or ""
    telefone = normalizar_telefone(remote.split("@")[0])
    if not telefone_valido(telefone):
        return None

    msg = dados.get("message") or {}
    texto = (
        msg.get("conversation")
        or (msg.get("extendedTextMessage") or {}).get("text")
        or (msg.get("imageMessage") or {}).get("caption")
        or "[mídia recebida]"
    )

    return {
        "telefone": telefone,
        "texto": texto,
        "nome": dados.get("pushName"),
    }
