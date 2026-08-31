"""Lead: qualificação pela conversa + persistência no banco.

Um vocabulário só de temperatura (frio/morno/quente) para os dois caminhos —
o que a pessoa DIZ na conversa e o que ela FAZ (simular, avaliar troca, agendar).
A temperatura final é a maior das duas, para um lado nunca esconder o outro.
"""

from __future__ import annotations

import json
import re

from .db import banco
from .estoque import normalizar

# ── Sinais na conversa ───────────────────────────────────────────────

TELEFONE_RE = re.compile(r"(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[\s.-]?\d{4}")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")

TOKENS_VEICULO = [
    "carro", "moto", "caminhao", "picape", "pick-up", "pickup", "suv", "sedan",
    "onibus", "carreta", "trator", "utilitario", "furgao", "van",
    "hilux", "ranger", "s10", "strada", "toro", "saveiro", "onix", "hb20",
    "corolla", "civic", "compass", "t-cross", "creta", "tracker", "kicks",
    "biz", "cg", "fan", "titan", "cb", "mt-03", "xre", "bros",
]

TOKENS_ORCAMENTO = [
    "r$", "reais", "mil", "orcamento", "orçamento", "entrada", "parcela",
    "prestacao", "prestação", "financiar", "financiamento", "a vista", "à vista",
    "quanto custa", "quanto fica", "quanto sai", "valor", "preco", "preço",
]

TOKENS_TROCA = [
    "na troca", "de troca", "dar meu", "dou meu", "tenho um", "tenho uma",
    "meu carro", "minha moto", "meu caminhao", "aceita troca", "avaliar meu",
    "trocar meu", "entrada com",
]

TOKENS_PRAZO = [
    "urgente", "hoje", "amanha", "amanhã", "essa semana", "esta semana",
    "esse mes", "este mes", "esse mês", "este mês", "proximo mes", "próximo mês",
    "ainda esse ano", "sem pressa", "so olhando", "só olhando", "pra ja", "pra já",
]

# Peso de cada sinal. Telefone e troca pesam mais: são os que viram negócio.
PESOS = {
    "veiculo": 20,
    "orcamento": 25,
    "troca": 25,
    "prazo": 15,
    "telefone": 35,
}

# Perguntas do roteiro, na ordem em que devem ser feitas.
PERGUNTAS = {
    "veiculo": "que tipo de veículo ela procura",
    "orcamento": "qual a faixa de preço ou quanto cabe de parcela",
    "troca": "se ela tem veículo na troca e qual é",
    "prazo": "para quando ela pretende resolver",
    "telefone": "o nome e o WhatsApp dela",
}

# Pontos por interação registrada (o que a pessoa FAZ).
PONTOS_INTERACAO = {
    "chat": 5,
    "whatsapp": 8,
    "simulacao_financiamento": 15,
    "avaliacao_troca": 20,
    "visita": 30,
    "proposta": 50,
}


def _tem(texto: str, tokens: list[str]) -> bool:
    return any(tok in texto for tok in tokens)


def detectar_telefone(texto: str) -> str | None:
    """Devolve o telefone só se parecer mesmo um número de contato.

    Evita casar com preço ("45.000") e com ano ("2021") exigindo 10-11 dígitos.
    """
    for bruto in TELEFONE_RE.findall(texto or ""):
        digitos = re.sub(r"\D", "", bruto)
        if len(digitos) in (10, 11):
            return digitos
    # Formato colado, com ou sem DDI.
    for m in re.finditer(r"\b(?:55)?(\d{10,11})\b", re.sub(r"[\s().-]", "", texto or "")):
        return m.group(1)
    return None


def detectar_email(texto: str) -> str | None:
    m = EMAIL_RE.search(texto or "")
    return m.group(0) if m else None


def temperatura_por_score(score: int) -> str:
    if score >= 60:
        return "quente"
    if score >= 30:
        return "morno"
    return "frio"


def qualificar(mensagem: str, historico: list[dict] | None = None) -> dict:
    """Lê a conversa inteira e devolve score, temperatura, sinais e próximo passo."""
    partes = [mensagem or ""]
    for m in historico or []:
        partes.append(m.get("texto") or m.get("conteudo") or "")
    bruto = "\n".join(partes)
    texto = normalizar(bruto)

    telefone = detectar_telefone(bruto)

    sinais = {
        "veiculo": _tem(texto, TOKENS_VEICULO),
        "orcamento": _tem(texto, TOKENS_ORCAMENTO),
        "troca": _tem(texto, TOKENS_TROCA),
        "prazo": _tem(texto, TOKENS_PRAZO),
        "telefone": telefone is not None,
    }

    score = min(100, sum(PESOS[k] for k, presente in sinais.items() if presente))

    proxima = None
    for chave in ("veiculo", "orcamento", "troca", "prazo", "telefone"):
        if not sinais[chave]:
            proxima = PERGUNTAS[chave]
            break

    return {
        "score": score,
        "temperatura": temperatura_por_score(score),
        "sinais": sinais,
        "proxima_pergunta": proxima,
        "telefone": telefone,
        "email": detectar_email(bruto),
    }


# ── Persistência ─────────────────────────────────────────────────────


def _score_interacoes(conn, lead_id: int) -> int:
    linhas = conn.execute(
        "SELECT tipo FROM lead_interacoes WHERE lead_id = ?", (lead_id,)
    ).fetchall()
    return min(100, sum(PONTOS_INTERACAO.get(l["tipo"], 0) for l in linhas))


def _recalcular(conn, lead_id: int, score_conversa: int = 0) -> tuple[int, str]:
    """Temperatura final = a mais quente entre o que foi dito e o que foi feito."""
    por_interacao = _score_interacoes(conn, lead_id)
    estagio = conn.execute(
        "SELECT estagio FROM leads WHERE id = ?", (lead_id,)
    ).fetchone()["estagio"]

    score = max(por_interacao, score_conversa)
    temperatura = temperatura_por_score(score)

    # Quem já marcou visita ou recebeu proposta está quente, custe o que custar.
    if estagio in ("visita", "proposta"):
        temperatura = "quente"

    conn.execute(
        "UPDATE leads SET score = ?, temperatura = ?, atualizado_em = datetime('now') "
        "WHERE id = ?",
        (score, temperatura, lead_id),
    )
    return score, temperatura


def upsert(
    *,
    nome: str | None = None,
    telefone: str | None = None,
    email: str | None = None,
    origem: str = "site",
    interesse: str | None = None,
) -> int | None:
    """Cria ou atualiza o lead. Sem telefone nem e-mail, não há lead."""
    if not telefone and not email:
        return None

    with banco() as conn:
        row = None
        if telefone:
            row = conn.execute(
                "SELECT id FROM leads WHERE telefone = ?", (telefone,)
            ).fetchone()
        if row is None and email:
            row = conn.execute(
                "SELECT id FROM leads WHERE email = ?", (email,)
            ).fetchone()

        if row:
            lead_id = row["id"]
            conn.execute(
                """UPDATE leads SET
                       nome      = COALESCE(?, nome),
                       telefone  = COALESCE(?, telefone),
                       email     = COALESCE(?, email),
                       interesse = COALESCE(?, interesse),
                       atualizado_em = datetime('now')
                   WHERE id = ?""",
                (nome, telefone, email, interesse, lead_id),
            )
            return lead_id

        cur = conn.execute(
            "INSERT INTO leads (nome, telefone, email, origem, interesse) "
            "VALUES (?,?,?,?,?)",
            (nome, telefone, email, origem, interesse),
        )
        return cur.lastrowid


def registrar_interacao(
    lead_id: int, tipo: str, descricao: str = "", metadata: dict | None = None,
    score_conversa: int = 0,
) -> tuple[int, str]:
    """Grava a interação e devolve (score, temperatura) já recalculados."""
    with banco() as conn:
        conn.execute(
            "INSERT INTO lead_interacoes (lead_id, tipo, descricao, metadata) "
            "VALUES (?,?,?,?)",
            (lead_id, tipo, descricao, json.dumps(metadata or {}, ensure_ascii=False)),
        )
        return _recalcular(conn, lead_id, score_conversa)


def obter(lead_id: int) -> dict | None:
    with banco() as conn:
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
    return dict(row) if row else None


def registrar_evento(
    nome: str, *, lead_id: int | None = None, conversa_id: int | None = None,
    payload: dict | None = None, chave_unica: str | None = None,
) -> bool:
    """Grava um evento do funil. Devolve False se a chave já existia.

    É esse False que impede o dono de receber o mesmo aviso duas vezes.
    """
    with banco() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO eventos_funil (nome, lead_id, conversa_id, payload, chave_unica) "
            "VALUES (?,?,?,?,?)",
            (nome, lead_id, conversa_id,
             json.dumps(payload or {}, ensure_ascii=False), chave_unica),
        )
        return cur.rowcount > 0


def painel() -> dict:
    """Resumo para acompanhar o funil."""
    with banco() as conn:
        temps = conn.execute(
            "SELECT temperatura, COUNT(*) n FROM leads GROUP BY temperatura"
        ).fetchall()
        estagios = conn.execute(
            "SELECT estagio, COUNT(*) n FROM leads GROUP BY estagio"
        ).fetchall()
        quentes = conn.execute(
            "SELECT id, nome, telefone, interesse, score, atualizado_em "
            "FROM leads WHERE temperatura = 'quente' "
            "ORDER BY atualizado_em DESC LIMIT 20"
        ).fetchall()
        total = conn.execute("SELECT COUNT(*) n FROM leads").fetchone()["n"]

    return {
        "total": total,
        "por_temperatura": {r["temperatura"]: r["n"] for r in temps},
        "por_estagio": {r["estagio"]: r["n"] for r in estagios},
        "quentes": [dict(r) for r in quentes],
    }
