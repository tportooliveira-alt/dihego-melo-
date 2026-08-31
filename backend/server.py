"""API da DM81 Consultoria & Finanças.

Sobe com:  uvicorn server:app --host 127.0.0.1 --port 8000
"""

from __future__ import annotations

import json
import secrets
from contextlib import asynccontextmanager

from fastapi import Body, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import atendimento, config, estoque, ia, lead as mod_lead, whatsapp
from app.db import init_db


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    init_db()
    # Carrega o estoque do arquivo exportado do site, se existir.
    if config.ESTOQUE_JSON.exists():
        try:
            dados = json.loads(config.ESTOQUE_JSON.read_text(encoding="utf-8"))
            estoque.importar(dados.get("veiculos", dados))
        except Exception as e:  # não impede o servidor de subir
            print(f"[dm81] não consegui importar o estoque: {type(e).__name__}: {e}")
    yield


app = FastAPI(title="DM81 API", version="1.0.0", lifespan=ciclo_de_vida)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "ia_configurada": ia.disponivel(),
        "whatsapp_configurado": whatsapp.disponivel(),
        "auto_reply": config.WHATSAPP_AUTO_REPLY,
        "aviso_dono_configurado": bool(config.WHATSAPP_DONO and config.NOTIFICAR_DONO),
        "veiculos_ativos": len(estoque.listar()),
    }


@app.get("/api/veiculos")
def listar_veiculos():
    """O site usa isto quando está servido pela VPS; sem ele, cai no js/data.js."""
    return {"veiculos": estoque.listar()}


@app.get("/api/veiculos/{veiculo_id}")
def obter_veiculo(veiculo_id: int):
    v = estoque.por_id(veiculo_id)
    if not v:
        raise HTTPException(status_code=404, detail="veiculo_nao_encontrado")
    return v


@app.post("/api/chat")
def chat(payload: dict = Body(...)):
    mensagem = (payload.get("mensagem") or payload.get("message") or "").strip()
    if not mensagem:
        raise HTTPException(status_code=400, detail="mensagem_vazia")
    if len(mensagem) > 2000:
        mensagem = mensagem[:2000]

    sessao = (payload.get("sessao") or payload.get("session_id")
              or secrets.token_urlsafe(9))

    resultado = atendimento.atender(
        mensagem,
        sessao_id=sessao,
        canal="site",
        nome=payload.get("nome"),
        telefone=payload.get("telefone"),
    )
    return resultado


@app.post("/api/whatsapp/webhook")
async def webhook_whatsapp(
    request: Request,
    x_webhook_token: str | None = Header(default=None, alias="X-Webhook-Token"),
):
    # Sem essa checagem o webhook fica aberto para qualquer um na internet.
    if config.EVOLUTION_WEBHOOK_TOKEN:
        if not x_webhook_token or not secrets.compare_digest(
            x_webhook_token, config.EVOLUTION_WEBHOOK_TOKEN
        ):
            raise HTTPException(status_code=401, detail="token_invalido")

    payload = await request.json()
    dados = whatsapp.extrair_do_webhook(payload)
    if not dados:
        return {"ignorado": True}

    # Registra o contato mesmo com a auto-resposta desligada: o lead não se perde.
    if not config.WHATSAPP_AUTO_REPLY:
        lead_id = mod_lead.upsert(
            nome=dados["nome"], telefone=dados["telefone"], origem="whatsapp",
            interesse=dados["texto"][:200],
        )
        if lead_id:
            # Mesmo sem responder, um lead que esquenta chega ao dono.
            mod_lead.registrar_interacao(
                lead_id, "whatsapp", descricao=dados["texto"][:200], canal="whatsapp"
            )
        return {"recebido": True, "auto_reply": False}

    resultado = atendimento.atender(
        dados["texto"],
        sessao_id=f"wa:{dados['telefone']}",
        canal="whatsapp",
        nome=dados["nome"],
        telefone=dados["telefone"],
    )

    envio = whatsapp.enviar(dados["telefone"], resultado["resposta"])
    return {
        "recebido": True,
        "auto_reply": True,
        "respondido": envio.enviado,
        "bloqueado_por": envio.bloqueado_por,
    }


@app.get("/api/funil")
def funil():
    """Painel do funil. Publique atrás de autenticação antes de expor na internet."""
    return mod_lead.painel()


@app.exception_handler(Exception)
async def erro_inesperado(request: Request, exc: Exception):
    print(f"[dm81] erro em {request.url.path}: {type(exc).__name__}: {exc}")
    return JSONResponse(status_code=500, content={"erro": "interno"})
