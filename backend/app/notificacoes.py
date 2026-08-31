"""Repasse do lead quente para o dono.

Quando um lead esquenta, o dono recebe no WhatsApp um resumo com o contato e o
que a pessoa procura — para ligar enquanto ela ainda está interessada.

O aviso sai UMA VEZ por lead: a chave única do evento no banco garante isso,
mesmo com o servidor rodando em vários workers.
"""

from __future__ import annotations

from . import config, lead as mod_lead, whatsapp
from .db import banco


def _resumo_da_conversa(conversa_id: int | None, limite: int = 6) -> str:
    """Últimas falas da pessoa, para o dono saber do que se trata."""
    if not conversa_id:
        return ""
    with banco() as conn:
        linhas = conn.execute(
            "SELECT conteudo FROM mensagens_conversa "
            "WHERE conversa_id = ? AND papel = 'usuario' "
            "ORDER BY id DESC LIMIT ?",
            (conversa_id, limite),
        ).fetchall()
    falas = [l["conteudo"].strip() for l in reversed(linhas) if l["conteudo"].strip()]
    return " | ".join(falas)[:400]


def montar_mensagem(lead: dict, resumo: str, canal: str) -> str:
    linhas = ["🔥 LEAD QUENTE — DM81", ""]

    if lead.get("nome"):
        linhas.append(f"Nome: {lead['nome']}")
    if lead.get("telefone"):
        linhas.append(f"WhatsApp: {lead['telefone']}")
    if lead.get("email"):
        linhas.append(f"E-mail: {lead['email']}")

    linhas.append(f"Score: {lead.get('score', 0)}/100")
    linhas.append(f"Origem: {canal}")

    if lead.get("interesse"):
        linhas.append(f"Procura: {lead['interesse']}")
    if resumo:
        linhas.append("")
        linhas.append(f"O que ela disse: {resumo}")

    linhas.append("")
    linhas.append("Fale com essa pessoa agora — ela está pronta.")

    if lead.get("telefone"):
        linhas.append(f"https://wa.me/{whatsapp.normalizar_telefone(lead['telefone'])}")

    return "\n".join(linhas)


def avisar_dono_se_quente(
    lead_id: int | None,
    temperatura: str,
    *,
    conversa_id: int | None = None,
    canal: str = "site",
) -> dict:
    """Chame sempre que a temperatura do lead for recalculada.

    Devolve o que aconteceu — útil para log e para os testes.
    """
    if not lead_id or temperatura != "quente":
        return {"avisado": False, "motivo": "nao_quente"}

    if not config.NOTIFICAR_DONO:
        return {"avisado": False, "motivo": "desligado"}

    if not config.WHATSAPP_DONO:
        return {"avisado": False, "motivo": "sem_numero_do_dono"}

    # A chave por lead é o que garante um aviso só, mesmo com vários workers.
    primeira_vez = mod_lead.registrar_evento(
        "lead.quente",
        lead_id=lead_id,
        conversa_id=conversa_id,
        payload={"canal": canal},
        chave_unica=f"lead.quente:{lead_id}",
    )
    if not primeira_vez:
        return {"avisado": False, "motivo": "ja_avisado"}

    lead = mod_lead.obter(lead_id)
    if not lead:
        return {"avisado": False, "motivo": "lead_sumiu"}

    texto = montar_mensagem(lead, _resumo_da_conversa(conversa_id), canal)
    envio = whatsapp.enviar(config.WHATSAPP_DONO, texto, finalidade="aviso_dono")

    if envio.enviado:
        return {"avisado": True, "lead_id": lead_id}

    # Não deu para avisar agora: solta a chave para tentar de novo na próxima
    # mensagem, em vez de perder o lead em silêncio.
    with banco() as conn:
        conn.execute(
            "DELETE FROM eventos_funil WHERE chave_unica = ?",
            (f"lead.quente:{lead_id}",),
        )

    return {
        "avisado": False,
        "motivo": envio.bloqueado_por or envio.erro or (
            "nao_configurado" if envio.nao_configurado else "falhou"
        ),
    }
