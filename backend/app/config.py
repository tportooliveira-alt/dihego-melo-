"""Configuração lida do ambiente.

Nada de segredo no código: tudo vem do .env da VPS (veja .env.exemplo).
"""

from __future__ import annotations

import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# ── Banco ────────────────────────────────────────────────────────────
DB_PATH = Path(os.getenv("DM81_DB_PATH", RAIZ / "data" / "dm81.db"))
ESTOQUE_JSON = Path(os.getenv("DM81_ESTOQUE_JSON", RAIZ / "data" / "estoque.json"))

# ── IA ───────────────────────────────────────────────────────────────
MODELO_IA = os.getenv("DM81_MODELO_IA", "claude-opus-5")
MAX_TOKENS_IA = int(os.getenv("DM81_MAX_TOKENS_IA", "1024"))

# ── WhatsApp (Evolution API) ─────────────────────────────────────────
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "").rstrip("/")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")
EVOLUTION_INSTANCIA = os.getenv("EVOLUTION_INSTANCIA", "dm81")

# Segredo que o Evolution deve mandar no webhook. Sem ele, o webhook é público.
EVOLUTION_WEBHOOK_TOKEN = os.getenv("EVOLUTION_WEBHOOK_TOKEN", "")

# Responde sozinho no WhatsApp? Desligado por padrão — ligue só depois de testar.
WHATSAPP_AUTO_REPLY = os.getenv("WHATSAPP_AUTO_REPLY", "0") == "1"

# Em modo teste, só responde para os números desta lista (separados por vírgula).
WHATSAPP_MODO_TESTE = os.getenv("WHATSAPP_MODO_TESTE", "0") == "1"
WHATSAPP_NUMEROS_TESTE = [
    n.strip() for n in os.getenv("WHATSAPP_NUMEROS_TESTE", "").split(",") if n.strip()
]

# Teto de mensagens automáticas por dia — trava contra banimento do número.
WHATSAPP_LIMITE_DIARIO = int(os.getenv("WHATSAPP_LIMITE_DIARIO", "50"))
# Intervalo mínimo entre duas respostas automáticas para o mesmo número.
WHATSAPP_COOLDOWN_SEG = int(os.getenv("WHATSAPP_COOLDOWN_SEG", "20"))

# ── Repasse de lead quente para o dono ───────────────────────────────
# Número que recebe o aviso quando um lead esquenta (só dígitos, com DDI 55).
WHATSAPP_DONO = os.getenv("WHATSAPP_DONO", "")
# Liga/desliga o repasse automático.
NOTIFICAR_DONO = os.getenv("DM81_NOTIFICAR_DONO", "1") == "1"

# ── HTTP ─────────────────────────────────────────────────────────────
CORS_ORIGINS = [
    o.strip() for o in os.getenv("DM81_CORS_ORIGINS", "*").split(",") if o.strip()
]
