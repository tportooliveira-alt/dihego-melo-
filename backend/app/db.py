"""Banco SQLite: schema e conexão.

O schema é uma constante com CREATE TABLE IF NOT EXISTS — `init_db()` roda no
start do servidor e é idempotente, então não há ferramenta de migração.
"""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager

from .config import DB_PATH

SCHEMA = """
-- Estoque de veículos (espelho do js/data.js, importado por scripts/importar_estoque.py)
CREATE TABLE IF NOT EXISTS veiculos (
    id           INTEGER PRIMARY KEY,
    tipo         TEXT NOT NULL,
    marca        TEXT NOT NULL,
    modelo       TEXT NOT NULL,
    versao       TEXT,
    ano          INTEGER,
    km           INTEGER,
    horas        INTEGER,
    preco        REAL NOT NULL,
    combustivel  TEXT,
    cambio       TEXT,
    cor          TEXT,
    portas       INTEGER,
    destaque     INTEGER NOT NULL DEFAULT 0,
    ativo        INTEGER NOT NULL DEFAULT 1,
    descricao    TEXT,
    opcionais    TEXT,          -- JSON
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_veiculos_tipo  ON veiculos(tipo, ativo);
CREATE INDEX IF NOT EXISTS idx_veiculos_preco ON veiculos(preco, ativo);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT,
    telefone     TEXT,
    email        TEXT,
    origem       TEXT NOT NULL DEFAULT 'site',   -- site|chat|whatsapp|simulador|avaliacao|manual
    estagio      TEXT NOT NULL DEFAULT 'novo',   -- novo|contatado|qualificado|visita|proposta|fechado|perdido
    temperatura  TEXT NOT NULL DEFAULT 'frio',   -- frio|morno|quente
    score        INTEGER NOT NULL DEFAULT 0,
    interesse    TEXT,                            -- o que a pessoa procura, em texto
    observacoes  TEXT,
    criado_em    TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_telefone    ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_email       ON leads(email);

-- Interações que pontuam o lead
CREATE TABLE IF NOT EXISTS lead_interacoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id       INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tipo          TEXT NOT NULL,
    descricao     TEXT,
    metadata      TEXT,          -- JSON
    criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_interacoes_lead ON lead_interacoes(lead_id, criado_em);

-- Conversas do chat do site e do WhatsApp
CREATE TABLE IF NOT EXISTS conversas (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id      TEXT NOT NULL UNIQUE,
    canal          TEXT NOT NULL DEFAULT 'site',
    lead_id        INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    ultimo_score   INTEGER NOT NULL DEFAULT 0,
    ultima_temperatura TEXT NOT NULL DEFAULT 'frio',
    criado_em      TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mensagens_conversa (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    conversa_id   INTEGER NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
    papel         TEXT NOT NULL,       -- usuario|assistente
    conteudo      TEXT NOT NULL,
    chave_mensagem TEXT UNIQUE,        -- idempotência: reprocessar não duplica
    criado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens_conversa(conversa_id, id);

-- Eventos do funil. A chave única é o que impede avisar o dono duas vezes.
CREATE TABLE IF NOT EXISTS eventos_funil (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL,
    lead_id         INTEGER,
    conversa_id     INTEGER,
    payload         TEXT,
    chave_unica     TEXT UNIQUE,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_eventos_nome ON eventos_funil(nome, criado_em);

-- Telemetria das chamadas de IA
CREATE TABLE IF NOT EXISTS execucoes_ia (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    conversa_id  INTEGER,
    modelo       TEXT,
    sucesso      INTEGER NOT NULL DEFAULT 0,
    fallback     INTEGER NOT NULL DEFAULT 0,
    duracao_ms   INTEGER,
    erro         TEXT,
    criado_em    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registro de envios de WhatsApp (alimenta limite diário e cooldown)
CREATE TABLE IF NOT EXISTS envios_whatsapp (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone    TEXT NOT NULL,
    finalidade  TEXT NOT NULL,      -- auto_reply|aviso_dono
    sucesso     INTEGER NOT NULL DEFAULT 0,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_envios_data ON envios_whatsapp(criado_em);
CREATE INDEX IF NOT EXISTS idx_envios_tel  ON envios_whatsapp(telefone, criado_em);
"""


def conectar() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def banco():
    conn = conectar()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with banco() as conn:
        conn.executescript(SCHEMA)
