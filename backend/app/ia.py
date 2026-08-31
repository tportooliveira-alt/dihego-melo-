"""Chamada ao Claude, com queda suave.

Se a chave não estiver configurada ou a API falhar, devolve um texto de apoio em
vez de estourar: o atendimento nunca fica sem resposta.
"""

from __future__ import annotations

import os
import time

from . import config
from .db import banco
from .prompts import RESPOSTA_INDISPONIVEL


def _cliente():
    """Importa o SDK só quando precisa — o servidor sobe sem ele instalado."""
    if not (os.getenv("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")):
        return None
    try:
        import anthropic
    except ImportError:
        return None
    return anthropic.Anthropic()


def disponivel() -> bool:
    return _cliente() is not None


def _registrar(conversa_id, modelo, sucesso, fallback, duracao_ms, erro=None) -> None:
    try:
        with banco() as conn:
            conn.execute(
                "INSERT INTO execucoes_ia (conversa_id, modelo, sucesso, fallback, "
                "duracao_ms, erro) VALUES (?,?,?,?,?,?)",
                (conversa_id, modelo, 1 if sucesso else 0, 1 if fallback else 0,
                 duracao_ms, erro),
            )
    except Exception:
        # Telemetria não pode derrubar o atendimento.
        pass


def responder(
    system: str,
    historico: list[dict],
    mensagem: str,
    *,
    conversa_id: int | None = None,
) -> dict:
    """Devolve {'texto', 'fallback', 'modelo'}. Nunca levanta exceção."""
    cliente = _cliente()
    inicio = time.monotonic()

    if cliente is None:
        _registrar(conversa_id, None, False, True, 0, "sem_credencial")
        return {"texto": RESPOSTA_INDISPONIVEL, "fallback": True, "modelo": None}

    mensagens = []
    for m in historico or []:
        papel = "assistant" if m.get("papel") in ("assistente", "assistant") else "user"
        conteudo = (m.get("texto") or m.get("conteudo") or "").strip()
        if conteudo:
            mensagens.append({"role": papel, "content": conteudo})
    mensagens.append({"role": "user", "content": mensagem})

    try:
        resposta = cliente.messages.create(
            model=config.MODELO_IA,
            max_tokens=config.MAX_TOKENS_IA,
            # A persona é longa e fixa: cachear o prefixo derruba o custo por
            # mensagem depois da primeira.
            system=[{"type": "text", "text": system,
                     "cache_control": {"type": "ephemeral"}}],
            messages=mensagens,
        )

        if resposta.stop_reason == "refusal":
            _registrar(conversa_id, config.MODELO_IA, False, True,
                       int((time.monotonic() - inicio) * 1000), "refusal")
            return {"texto": RESPOSTA_INDISPONIVEL, "fallback": True,
                    "modelo": config.MODELO_IA}

        texto = "".join(
            b.text for b in resposta.content if getattr(b, "type", None) == "text"
        ).strip()

        if not texto:
            _registrar(conversa_id, config.MODELO_IA, False, True,
                       int((time.monotonic() - inicio) * 1000), "resposta_vazia")
            return {"texto": RESPOSTA_INDISPONIVEL, "fallback": True,
                    "modelo": config.MODELO_IA}

        _registrar(conversa_id, config.MODELO_IA, True, False,
                   int((time.monotonic() - inicio) * 1000))
        return {"texto": texto, "fallback": False, "modelo": config.MODELO_IA}

    except Exception as e:
        _registrar(conversa_id, config.MODELO_IA, False, True,
                   int((time.monotonic() - inicio) * 1000), type(e).__name__)
        return {"texto": RESPOSTA_INDISPONIVEL, "fallback": True,
                "modelo": config.MODELO_IA}
