"""Estoque: busca de veículos e montagem do contexto que a IA enxerga.

Ao contrário de um resumo só com agregados, aqui a IA recebe as UNIDADES que
casam com o que a pessoa perguntou — numa loja de veículos o cliente pergunta
por item ("tem Corolla 2021 até 120 mil?"), não por média de preço.
"""

from __future__ import annotations

import json
import re
import unicodedata

from .db import banco

TIPOS = {
    "carro": ["carro", "carros", "automovel", "automoveis", "sedan", "hatch", "suv", "pickup", "picape", "pick-up"],
    "moto": ["moto", "motos", "motocicleta", "scooter"],
    "caminhao": ["caminhao", "caminhoes", "truck", "bau", "toco"],
    "utilitario": ["utilitario", "utilitarios", "furgao", "van", "kombi"],
    "onibus": ["onibus", "microonibus", "micro-onibus", "van escolar"],
    "carreta": ["carreta", "carretas", "semirreboque", "reboque", "graneleira"],
    "trator": ["trator", "tratores", "maquina agricola", "colheitadeira"],
}


def normalizar(texto: str) -> str:
    """Minúsculo e sem acento — para comparar o que a pessoa digita."""
    texto = unicodedata.normalize("NFKD", texto or "")
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return texto.lower()


def _linha_para_dict(row) -> dict:
    v = dict(row)
    v["opcionais"] = json.loads(v.get("opcionais") or "[]")
    v["destaque"] = bool(v.get("destaque"))
    return v


def listar(ativos_apenas: bool = True) -> list[dict]:
    sql = "SELECT * FROM veiculos"
    if ativos_apenas:
        sql += " WHERE ativo = 1"
    sql += " ORDER BY destaque DESC, preco ASC"
    with banco() as conn:
        return [_linha_para_dict(r) for r in conn.execute(sql).fetchall()]


def por_id(veiculo_id: int) -> dict | None:
    with banco() as conn:
        row = conn.execute(
            "SELECT * FROM veiculos WHERE id = ? AND ativo = 1", (veiculo_id,)
        ).fetchone()
    return _linha_para_dict(row) if row else None


def _preco_do_texto(texto: str) -> float | None:
    """Extrai um teto de preço de frases como 'até 120 mil' ou 'até R$ 90.000'."""
    t = normalizar(texto)

    m = re.search(r"(?:ate|no maximo|maximo de|no max)\s*r?\$?\s*([\d.,]+)\s*(mil|k)?", t)
    if not m:
        return None
    bruto = m.group(1).replace(".", "").replace(",", ".")
    try:
        valor = float(bruto)
    except ValueError:
        return None
    if m.group(2) or valor < 1000:
        valor *= 1000
    return valor


def _ano_minimo_do_texto(texto: str) -> int | None:
    t = normalizar(texto)
    m = re.search(r"(?:a partir de|de)\s*(19[89]\d|20[0-4]\d)", t)
    if m:
        return int(m.group(1))
    anos = [int(a) for a in re.findall(r"\b(20[0-4]\d)\b", t)]
    return min(anos) if anos else None


def buscar(texto: str, limite: int = 8) -> list[dict]:
    """Casa o texto livre da pessoa com o estoque.

    Camadas independentes que se somam: tipo, marca/modelo, teto de preço e ano.
    Sem nenhum sinal, devolve os destaques.
    """
    t = normalizar(texto)
    todos = listar()
    if not todos:
        return []

    tipo_pedido = None
    for tipo, termos in TIPOS.items():
        if any(termo in t for termo in termos):
            tipo_pedido = tipo
            break

    teto = _preco_do_texto(texto)
    ano_min = _ano_minimo_do_texto(texto)

    pontuados = []
    for v in todos:
        pontos = 0
        if tipo_pedido and v["tipo"] == tipo_pedido:
            pontos += 3
        if normalizar(v["marca"]) in t:
            pontos += 4
        if normalizar(v["modelo"]) in t:
            pontos += 5
        if teto is not None and v["preco"] <= teto:
            pontos += 2
        if ano_min is not None and (v["ano"] or 0) >= ano_min:
            pontos += 2
        if pontos:
            pontuados.append((pontos, v))

    if not pontuados:
        destaques = [v for v in todos if v["destaque"]]
        return (destaques or todos)[:limite]

    pontuados.sort(key=lambda p: (-p[0], p[1]["preco"]))
    return [v for _, v in pontuados[:limite]]


def _dinheiro(valor: float) -> str:
    return f"R$ {valor:,.0f}".replace(",", ".")


def descrever(v: dict) -> str:
    partes = [f"#{v['id']} {v['marca']} {v['modelo']}"]
    if v.get("versao"):
        partes.append(v["versao"])
    if v.get("ano"):
        partes.append(str(v["ano"]))
    if v.get("km") is not None:
        partes.append(f"{v['km']:,} km".replace(",", "."))
    elif v.get("horas") is not None:
        partes.append(f"{v['horas']:,} h".replace(",", "."))
    for campo in ("combustivel", "cambio", "cor"):
        if v.get(campo) and v[campo] != "—":
            partes.append(v[campo])
    partes.append(_dinheiro(v["preco"]))
    return " · ".join(partes)


def contexto_para_ia(pergunta: str) -> str:
    """Bloco de texto com o estoque que a IA pode citar.

    Regra do prompt: a IA só cita veículo que aparecer aqui. Se o banco cair,
    devolve string vazia e a IA continua atendendo sem citar unidade nenhuma.
    """
    try:
        todos = listar()
        if not todos:
            return ""

        casados = buscar(pergunta)
        linhas = [f"Estoque ativo: {len(todos)} veiculos."]

        contagem: dict[str, int] = {}
        for v in todos:
            contagem[v["tipo"]] = contagem.get(v["tipo"], 0) + 1
        resumo = ", ".join(f"{n} {tipo}" for tipo, n in sorted(contagem.items()))
        linhas.append(f"Por tipo: {resumo}.")

        if casados:
            linhas.append("")
            linhas.append("Veiculos que casam com a pergunta (cite apenas estes):")
            linhas.extend(f"- {descrever(v)}" for v in casados)

        return "\n".join(linhas)
    except Exception:
        # Banco fora do ar não pode derrubar o atendimento.
        return ""


def importar(veiculos: list[dict]) -> int:
    """Substitui o estoque pelo conteúdo do estoque.json. Devolve quantos entraram."""
    with banco() as conn:
        conn.execute("UPDATE veiculos SET ativo = 0")
        for v in veiculos:
            conn.execute(
                """
                INSERT INTO veiculos (id, tipo, marca, modelo, versao, ano, km, horas,
                                      preco, combustivel, cambio, cor, portas, destaque,
                                      ativo, descricao, opcionais, atualizado_em)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?, datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                    tipo=excluded.tipo, marca=excluded.marca, modelo=excluded.modelo,
                    versao=excluded.versao, ano=excluded.ano, km=excluded.km,
                    horas=excluded.horas, preco=excluded.preco,
                    combustivel=excluded.combustivel, cambio=excluded.cambio,
                    cor=excluded.cor, portas=excluded.portas, destaque=excluded.destaque,
                    ativo=1, descricao=excluded.descricao, opcionais=excluded.opcionais,
                    atualizado_em=datetime('now')
                """,
                (
                    v.get("id"), v.get("tipo"), v.get("marca"), v.get("modelo"),
                    v.get("versao"), v.get("ano"), v.get("km"), v.get("horas"),
                    v.get("preco"), v.get("combustivel"), v.get("cambio"),
                    v.get("cor"), v.get("portas"), 1 if v.get("destaque") else 0,
                    v.get("descricao"), json.dumps(v.get("opcionais") or [], ensure_ascii=False),
                ),
            )
    return len(veiculos)
