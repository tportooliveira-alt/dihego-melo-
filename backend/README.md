# Backend DM81 — atendimento com IA e repasse de lead quente

API em FastAPI que dá vida ao site: um atendente virtual conversa com o visitante,
qualifica o interesse dele e, **quando o lead esquenta, manda o contato direto no
WhatsApp do dono** — para ligar enquanto a pessoa ainda está interessada.

Roda numa VPS ao lado do site estático. Sem VPS, o site continua funcionando
normalmente: o chat encaminha para o WhatsApp e o estoque vem do `js/data.js`.

## Como funciona uma conversa

```
mensagem  →  qualifica o que a pessoa disse
          →  busca no estoque os veículos que casam com o pedido
          →  monta o prompt (persona + estoque + próximo passo do roteiro)
          →  Claude responde
          →  grava conversa, lead e pontuação
          →  lead quente?  →  WhatsApp para o dono  (uma vez só)
```

O mesmo caminho atende o chat do site e o WhatsApp — um cérebro só, duas portas.

## Quando um lead fica quente

Duas contagens que caminham juntas; vale sempre a mais quente das duas.

**O que a pessoa diz** (lido da conversa, `app/lead.py`):

| Sinal | Pontos |
| --- | --- |
| Disse que veículo procura | 20 |
| Falou de preço, entrada ou parcela | 25 |
| Tem veículo na troca | 25 |
| Disse para quando quer resolver | 15 |
| Deixou o telefone | 35 |

**O que a pessoa faz** (interações registradas):

| Ação | Pontos |
| --- | --- |
| Mensagem no chat | 5 |
| Mensagem no WhatsApp | 8 |
| Simulou financiamento | 15 |
| Pediu avaliação da troca | 20 |
| Agendou visita | 30 |
| Recebeu proposta | 50 |

**Faixas:** 60+ = quente · 30 a 59 = morno · abaixo de 30 = frio.
Quem já marcou visita ou recebeu proposta é sempre quente.

O aviso ao dono sai **uma vez por lead** — garantido pela chave única do evento
no banco, mesmo com o servidor rodando em vários workers. Se o envio falhar, a
chave é liberada para tentar de novo na próxima mensagem, em vez de perder o lead
em silêncio.

## Rotas

| Rota | O que faz |
| --- | --- |
| `GET /api/health` | Estado do serviço: IA, WhatsApp, aviso ao dono, nº de veículos |
| `GET /api/veiculos` | Estoque ativo (o site usa quando servido pela VPS) |
| `GET /api/veiculos/{id}` | Um veículo |
| `POST /api/chat` | Atendimento do site. Corpo: `{mensagem, sessao}` |
| `POST /api/whatsapp/webhook` | Recebe mensagens do Evolution API |
| `GET /api/funil` | Painel: leads por temperatura e lista dos quentes |

> **`/api/funil` expõe telefone de cliente.** Deixe atrás de autenticação antes de
> abrir na internet — há um exemplo comentado no `deploy/nginx.conf.example`.

## Instalação na VPS

Ubuntu 22.04, aplicação em `/var/www/dm81`, usuário `dm81`.

```bash
# 1. Código
sudo mkdir -p /var/www/dm81 && sudo chown dm81:dm81 /var/www/dm81
git clone <url-do-repositorio> /var/www/dm81
cd /var/www/dm81/backend

# 2. Ambiente Python
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 3. Configuração (preencha as chaves)
cp .env.exemplo .env && nano .env

# 4. Banco e estoque
node scripts/exportar_estoque.js          # js/data.js -> data/estoque.json
.venv/bin/python -c "from app.db import init_db; init_db()"

# 5. Serviço
sudo cp deploy/dm81.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now dm81

# 6. Nginx + HTTPS
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/dm81
sudo ln -s /etc/nginx/sites-available/dm81 /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d seudominio.com.br

# 7. Conferir
curl http://127.0.0.1:8000/api/health
```

Atualizações depois disso: `bash /var/www/dm81/backend/deploy/deploy.sh`.

## Configuração (`.env`)

| Variável | Para que serve |
| --- | --- |
| `ANTHROPIC_API_KEY` | Chave da API do Claude. Sem ela o chat cai no texto de apoio. |
| `DM81_MODELO_IA` | Modelo usado (padrão `claude-opus-5`). |
| `EVOLUTION_API_URL` / `_KEY` / `_INSTANCIA` | Conexão com a Evolution API. |
| `EVOLUTION_WEBHOOK_TOKEN` | Segredo do header `X-Webhook-Token`. **Sem ele o webhook fica aberto para qualquer um.** |
| `WHATSAPP_DONO` | Número que recebe o aviso de lead quente (só dígitos, com 55). |
| `DM81_NOTIFICAR_DONO` | `1` liga o repasse automático. |
| `WHATSAPP_AUTO_REPLY` | `1` faz a IA responder sozinha no WhatsApp. Comece em `0`. |
| `WHATSAPP_MODO_TESTE` / `_NUMEROS_TESTE` | Enquanto testa, só responde aos números da lista. |
| `WHATSAPP_LIMITE_DIARIO` / `_COOLDOWN_SEG` | Travas contra banimento do número. |
| `DM81_CORS_ORIGINS` | Domínios liberados. Troque o `*` pelo domínio real. |

## Ligando o WhatsApp com segurança

O número da loja pode ser **banido** se disparar mensagem automática demais.
A ordem recomendada:

1. Suba com `WHATSAPP_AUTO_REPLY=0`. O webhook já registra os leads, sem responder.
2. Configure `EVOLUTION_WEBHOOK_TOKEN` e aponte o webhook do Evolution para
   `https://seudominio.com.br/api/whatsapp/webhook` com esse header.
3. Ligue `WHATSAPP_MODO_TESTE=1` com o seu número em `WHATSAPP_NUMEROS_TESTE` e
   só então `WHATSAPP_AUTO_REPLY=1`. Converse com o robô você mesmo.
4. Deu certo? Desligue o modo teste. Deixe `WHATSAPP_LIMITE_DIARIO` conservador
   no começo (50 é um ponto de partida razoável).

O aviso de lead quente para o dono **não** entra nessas travas de volume: é raro
e é justamente o que faz o negócio acontecer.

## Estoque

`js/data.js` continua sendo a fonte de verdade. Depois de editar:

```bash
node backend/scripts/exportar_estoque.js   # gera backend/data/estoque.json
sudo systemctl restart dm81                # o backend reimporta ao subir
```

O `deploy.sh` já faz isso.

## Testes

```bash
cd backend
.venv/bin/python -m pytest tests/ -q
```

Rodam sem chave da Anthropic e sem Evolution: a IA cai no fallback e o WhatsApp
é substituído por um dublê que captura os envios. Cobrem a pontuação do lead,
a busca no estoque, as travas do WhatsApp e — principalmente — que o dono é
avisado uma vez só e que uma falha de envio não engole o lead.

## Ajustando o jeito de atender

O texto que define a personalidade, os limites e o roteiro de perguntas está em
`app/prompts.py`, em português e comentado. Mudar o tom da atendente é editar
esse arquivo — não precisa mexer em código.
