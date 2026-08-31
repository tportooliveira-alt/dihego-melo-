"""Orquestração do atendimento.

Uma mensagem entra e sai a resposta, com o lead qualificado, persistido e —
se estiver quente — repassado para o dono. É o mesmo caminho para o chat do
site e para o WhatsApp: um cérebro só.
"""

from __future__ import annotations

import hashlib

from . import estoque, ia, lead as mod_lead, prompts
from .db import banco


def _abrir_conversa(sessao_id: str, canal: str) -> int:
    with banco() as conn:
        row = conn.execute(
            "SELECT id FROM conversas WHERE sessao_id = ?", (sessao_id,)
        ).fetchone()
        if row:
            return row["id"]
        cur = conn.execute(
            "INSERT INTO conversas (sessao_id, canal) VALUES (?,?)", (sessao_id, canal)
        )
        return cur.lastrowid


def _gravar_mensagem(conversa_id: int, papel: str, conteudo: str) -> None:
    """Idempotente: reprocessar o mesmo webhook não duplica a mensagem."""
    chave = hashlib.sha256(
        f"{conversa_id}:{papel}:{conteudo}".encode("utf-8")
    ).hexdigest()
    with banco() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO mensagens_conversa "
            "(conversa_id, papel, conteudo, chave_mensagem) VALUES (?,?,?,?)",
            (conversa_id, papel, conteudo, chave),
        )


def historico_da_conversa(conversa_id: int, limite: int = 12) -> list[dict]:
    with banco() as conn:
        linhas = conn.execute(
            "SELECT papel, conteudo FROM mensagens_conversa "
            "WHERE conversa_id = ? ORDER BY id DESC LIMIT ?",
            (conversa_id, limite),
        ).fetchall()
    return [{"papel": l["papel"], "texto": l["conteudo"]} for l in reversed(linhas)]


def _resumir_interesse(mensagem: str, historico: list[dict]) -> str:
    """Primeira frase da pessoa que mencione veículo — serve de rótulo do lead."""
    for m in list(historico) + [{"texto": mensagem}]:
        texto = (m.get("texto") or "").strip()
        if texto and any(
            tok in estoque.normalizar(texto) for tok in mod_lead.TOKENS_VEICULO
        ):
            return texto[:200]
    return (mensagem or "")[:200]


def atender(
    mensagem: str,
    *,
    sessao_id: str,
    canal: str = "site",
    nome: str | None = None,
    telefone: str | None = None,
) -> dict:
    """Caminho completo de uma mensagem. Nunca levanta exceção para o chamador."""
    mensagem = (mensagem or "").strip()
    if not mensagem:
        return {"resposta": "Pode escrever sua dúvida que eu te ajudo.", "temperatura": "frio"}

    conversa_id = _abrir_conversa(sessao_id, canal)
    historico = historico_da_conversa(conversa_id)

    _gravar_mensagem(conversa_id, "usuario", mensagem)

    # 1. Qualifica pelo que foi dito na conversa inteira.
    qualificacao = mod_lead.qualificar(mensagem, historico)

    # 2. Monta o contexto de estoque e pede a resposta à IA.
    contexto = estoque.contexto_para_ia(mensagem + " " + " ".join(
        m.get("texto", "") for m in historico[-3:]
    ))
    system = prompts.montar_system(contexto, qualificacao["proxima_pergunta"])
    saida = ia.responder(system, historico, mensagem, conversa_id=conversa_id)

    _gravar_mensagem(conversa_id, "assistente", saida["texto"])

    # 3. Persiste o lead — só existe lead quando há contato.
    telefone_final = telefone or qualificacao["telefone"]
    lead_id = mod_lead.upsert(
        nome=nome,
        telefone=telefone_final,
        email=qualificacao["email"],
        origem=canal,
        interesse=_resumir_interesse(mensagem, historico),
    )

    temperatura = qualificacao["temperatura"]
    score = qualificacao["score"]

    # 4. Persistir a interação já recalcula a temperatura e, se esquentou,
    #    avisa o dono — não há um segundo lugar onde isso possa ser esquecido.
    aviso = {"avisado": False}
    if lead_id:
        score, temperatura, aviso = mod_lead.registrar_interacao(
            lead_id,
            "whatsapp" if canal == "whatsapp" else "chat",
            descricao=mensagem[:200],
            score_conversa=qualificacao["score"],
            conversa_id=conversa_id,
            canal=canal,
        )
        with banco() as conn:
            conn.execute(
                "UPDATE conversas SET lead_id = ?, ultimo_score = ?, "
                "ultima_temperatura = ?, atualizado_em = datetime('now') WHERE id = ?",
                (lead_id, score, temperatura, conversa_id),
            )

    return {
        "resposta": saida["texto"],
        "sessao": sessao_id,
        "temperatura": temperatura,
        "score": score,
        "lead_id": lead_id,
        "fallback_ia": saida["fallback"],
        "dono_avisado": aviso.get("avisado", False),
    }
