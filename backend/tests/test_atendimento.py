"""Testes do atendimento: qualificação, estoque e repasse do lead quente.

Rode com:  cd backend && python -m pytest -q
Não precisa de chave da Anthropic nem de Evolution — a IA cai no fallback e o
WhatsApp é substituído por um dublê.
"""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

# Banco temporário: cada execução começa limpa.
_TMP = tempfile.mkdtemp(prefix="dm81-teste-")
os.environ["DM81_DB_PATH"] = str(Path(_TMP) / "teste.db")
os.environ["WHATSAPP_DONO"] = "5511988887777"
os.environ["DM81_NOTIFICAR_DONO"] = "1"

import pytest  # noqa: E402

from app import atendimento, config, estoque, lead, notificacoes, whatsapp  # noqa: E402
from app.db import init_db  # noqa: E402


@pytest.fixture(autouse=True)
def banco_limpo():
    init_db()
    from app.db import banco
    with banco() as conn:
        for tabela in ("eventos_funil", "lead_interacoes", "mensagens_conversa",
                       "conversas", "leads", "envios_whatsapp", "veiculos"):
            conn.execute(f"DELETE FROM {tabela}")
    estoque.importar([
        {"id": 1, "tipo": "carro", "marca": "Ford", "modelo": "Ranger",
         "versao": "3.0 V6 Limited 4x4", "ano": 2024, "km": 9800, "preco": 319900,
         "combustivel": "Diesel", "cambio": "Automático", "cor": "Azul",
         "destaque": True, "opcionais": ["Tração 4x4"]},
        {"id": 2, "tipo": "carro", "marca": "Chevrolet", "modelo": "Onix",
         "versao": "1.0 Turbo LTZ", "ano": 2023, "km": 28500, "preco": 84900,
         "combustivel": "Flex", "cambio": "Automático", "cor": "Branco",
         "destaque": True, "opcionais": []},
        {"id": 3, "tipo": "moto", "marca": "Honda", "modelo": "CB 500F",
         "versao": "ABS", "ano": 2023, "km": 8700, "preco": 39900,
         "combustivel": "Gasolina", "cambio": "Manual", "cor": "Vermelho",
         "destaque": False, "opcionais": []},
    ])
    yield


@pytest.fixture
def whatsapp_dublê(monkeypatch):
    """Captura os envios em vez de chamar a Evolution."""
    enviados = []

    def falso_enviar(numero, texto, finalidade="auto_reply"):
        enviados.append({"numero": numero, "texto": texto, "finalidade": finalidade})
        return whatsapp.Envio(enviado=True)

    monkeypatch.setattr(whatsapp, "enviar", falso_enviar)
    monkeypatch.setattr(notificacoes.whatsapp, "enviar", falso_enviar)
    return enviados


# ── Qualificação ─────────────────────────────────────────────────────

def test_pergunta_solta_fica_fria():
    q = lead.qualificar("Bom dia, vocês abrem sábado?")
    assert q["temperatura"] == "frio"
    assert q["telefone"] is None


def test_pede_o_que_falta_na_ordem_do_roteiro():
    q = lead.qualificar("Queria uma picape")
    assert q["sinais"]["veiculo"] is True
    # Já disse o veículo: a próxima pergunta tem que ser o orçamento.
    assert "preço" in q["proxima_pergunta"] or "parcela" in q["proxima_pergunta"]


def test_conversa_completa_esquenta():
    q = lead.qualificar(
        "Meu WhatsApp é (11) 98888-7777",
        historico=[
            {"texto": "Procuro uma picape 4x4"},
            {"texto": "Tenho até 300 mil de orçamento"},
            {"texto": "Tenho um Corolla 2019 na troca"},
            {"texto": "Preciso resolver essa semana"},
        ],
    )
    assert q["temperatura"] == "quente"
    assert q["telefone"] == "11988887777"
    assert q["proxima_pergunta"] is None


def test_preco_nao_e_confundido_com_telefone():
    q = lead.qualificar("Tenho 45.000 de entrada")
    assert q["telefone"] is None, "valor em reais não pode virar telefone"


def test_ano_nao_e_confundido_com_telefone():
    q = lead.qualificar("Procuro um carro 2021")
    assert q["telefone"] is None


# ── Estoque ──────────────────────────────────────────────────────────

def test_busca_casa_pelo_modelo():
    achados = estoque.buscar("vocês têm Ranger?")
    assert achados[0]["modelo"] == "Ranger"


def test_busca_respeita_teto_de_preco():
    achados = estoque.buscar("quero um carro até 100 mil")
    assert all(v["preco"] <= 100000 for v in achados[:1])


def test_busca_por_tipo_moto():
    achados = estoque.buscar("tem moto?")
    assert achados[0]["tipo"] == "moto"


def test_contexto_lista_so_o_que_existe():
    contexto = estoque.contexto_para_ia("tem Ranger?")
    assert "Ranger" in contexto
    assert "Estoque ativo: 3 veiculos." in contexto


def test_contexto_vazio_sem_estoque():
    estoque.importar([])
    from app.db import banco
    with banco() as conn:
        conn.execute("DELETE FROM veiculos")
    assert estoque.contexto_para_ia("tem Ranger?") == ""


# ── Repasse do lead quente ───────────────────────────────────────────

def test_dono_e_avisado_quando_o_lead_esquenta(whatsapp_dublê):
    lead_id = lead.upsert(telefone="11988887777", origem="site", interesse="picape 4x4")
    _, temperatura, aviso = lead.registrar_interacao(
        lead_id, "chat", score_conversa=100
    )
    assert temperatura == "quente"
    assert aviso["avisado"] is True, "registrar a interação já avisa o dono"
    assert len(whatsapp_dublê) == 1
    assert whatsapp_dublê[0]["numero"] == config.WHATSAPP_DONO
    assert "LEAD QUENTE" in whatsapp_dublê[0]["texto"]
    assert "11988887777" in whatsapp_dublê[0]["texto"]


def test_dono_nao_recebe_o_mesmo_lead_duas_vezes(whatsapp_dublê):
    lead_id = lead.upsert(telefone="11988887777", origem="site")
    lead.registrar_interacao(lead_id, "chat", score_conversa=100)

    # Mais mensagens da mesma pessoa não podem gerar aviso repetido.
    lead.registrar_interacao(lead_id, "chat", score_conversa=100)
    notificacoes.avisar_dono_se_quente(lead_id, "quente")

    assert len(whatsapp_dublê) == 1, "o dono não pode ser avisado em duplicidade"


def test_lead_frio_nao_incomoda_o_dono(whatsapp_dublê):
    lead_id = lead.upsert(telefone="11988887777", origem="site")
    r = notificacoes.avisar_dono_se_quente(lead_id, "frio")
    assert r["avisado"] is False
    assert whatsapp_dublê == []


def test_falha_no_envio_permite_tentar_de_novo(monkeypatch):
    """Se o WhatsApp cair, o lead não pode ser dado como avisado."""
    tentativas = []

    def falha(numero, texto, finalidade="auto_reply"):
        tentativas.append(numero)
        return whatsapp.Envio(enviado=False, erro="http_500")

    monkeypatch.setattr(notificacoes.whatsapp, "enviar", falha)

    lead_id = lead.upsert(telefone="11988887777", origem="site")
    r1 = notificacoes.avisar_dono_se_quente(lead_id, "quente")
    r2 = notificacoes.avisar_dono_se_quente(lead_id, "quente")

    assert r1["avisado"] is False
    assert r2["avisado"] is False
    assert len(tentativas) == 2, "tem que tentar de novo, não engolir o lead"


# ── Fluxo ponta a ponta ──────────────────────────────────────────────

def test_atendimento_responde_mesmo_sem_ia(whatsapp_dublê):
    """Sem chave da Anthropic, a resposta vem do fallback — nunca vazia."""
    r = atendimento.atender("Vocês têm picape?", sessao_id="s1", canal="site")
    assert r["resposta"]
    assert r["fallback_ia"] is True
    assert r["temperatura"] in ("frio", "morno", "quente")


def test_conversa_que_esquenta_avisa_o_dono(whatsapp_dublê):
    atendimento.atender("Procuro uma picape 4x4", sessao_id="s2")
    atendimento.atender("Tenho até 300 mil", sessao_id="s2")
    atendimento.atender("Tenho um Corolla 2019 na troca", sessao_id="s2")
    r = atendimento.atender(
        "Preciso essa semana, meu zap é (11) 98888-7777", sessao_id="s2"
    )

    assert r["temperatura"] == "quente"
    assert r["lead_id"] is not None
    assert r["dono_avisado"] is True
    assert len(whatsapp_dublê) == 1


def test_sem_contato_nao_cria_lead(whatsapp_dublê):
    r = atendimento.atender("Bom dia, quanto custa o Onix?", sessao_id="s3")
    assert r["lead_id"] is None
    assert whatsapp_dublê == []


def test_historico_da_conversa_persiste(whatsapp_dublê):
    atendimento.atender("Oi", sessao_id="s4")
    atendimento.atender("Tem Ranger?", sessao_id="s4")
    from app.atendimento import _abrir_conversa, historico_da_conversa
    hist = historico_da_conversa(_abrir_conversa("s4", "site"))
    textos = [m["texto"] for m in hist]
    assert "Oi" in textos and "Tem Ranger?" in textos


# ── Travas do WhatsApp ───────────────────────────────────────────────

def test_modo_teste_bloqueia_numero_de_fora(monkeypatch):
    monkeypatch.setattr(config, "WHATSAPP_MODO_TESTE", True)
    monkeypatch.setattr(config, "WHATSAPP_NUMEROS_TESTE", ["5511911112222"])
    monkeypatch.setattr(config, "EVOLUTION_API_URL", "https://exemplo")
    monkeypatch.setattr(config, "EVOLUTION_API_KEY", "chave")

    r = whatsapp.enviar("11999998888", "oi")
    assert r.bloqueado_por == "modo_teste"


def test_webhook_ignora_mensagem_da_propria_loja():
    payload = {"event": "messages.upsert",
               "data": {"key": {"fromMe": True, "remoteJid": "5511999998888@s.whatsapp.net"}}}
    assert whatsapp.extrair_do_webhook(payload) is None


def test_webhook_extrai_texto_e_telefone():
    payload = {
        "event": "messages.upsert",
        "data": {
            "key": {"fromMe": False, "remoteJid": "5511999998888@s.whatsapp.net"},
            "pushName": "João",
            "message": {"conversation": "Tem Ranger?"},
        },
    }
    d = whatsapp.extrair_do_webhook(payload)
    assert d == {"telefone": "5511999998888", "texto": "Tem Ranger?", "nome": "João"}


# ── Conversa não pode virar "quente" sozinha ─────────────────────────
# Calibrado com os dados reais do sistema irmão em produção, onde 95 de 182
# leads (52%) estavam marcados como quentes — o aviso ao dono vira ruído e
# ele para de confiar.

def test_muita_mensagem_nao_esquenta_o_lead(whatsapp_dublê):
    """Quem só conversa muito não pode disparar aviso para o dono."""
    lead_id = lead.upsert(telefone="11955554444", origem="whatsapp")
    for _ in range(20):
        _, temperatura, _aviso = lead.registrar_interacao(lead_id, "whatsapp", "oi")

    assert temperatura != "quente", "volume de mensagem não é sinal de compra"
    assert lead.obter(lead_id)["score"] <= lead.TETO_CONVERSA
    assert whatsapp_dublê == []


def test_acoes_reais_esquentam_o_lead(whatsapp_dublê):
    """Simular, trazer o usado e marcar visita é intenção de verdade."""
    lead_id = lead.upsert(telefone="11955553333", origem="site")
    lead.registrar_interacao(lead_id, "simulacao_financiamento")        # 15
    lead.registrar_interacao(lead_id, "avaliacao_troca")                # 20
    _, temperatura, aviso = lead.registrar_interacao(lead_id, "visita")  # 30

    assert temperatura == "quente"
    # O aviso sai mesmo sem ninguém ter conversado no chat.
    assert aviso["avisado"] is True
    assert len(whatsapp_dublê) == 1


def test_conversa_mais_acao_somam(whatsapp_dublê):
    """O teto limita a conversa, mas não impede a ação de contar por inteiro."""
    lead_id = lead.upsert(telefone="11955552222", origem="site")
    for _ in range(10):
        lead.registrar_interacao(lead_id, "chat")                  # teto: 12
    score, _t, _a = lead.registrar_interacao(lead_id, "proposta")  # +50

    assert score == lead.TETO_CONVERSA + 50
