#!/usr/bin/env bash
# Atualiza a DM81 na VPS. Rode como o usuário dono da aplicação:
#   bash /var/www/dm81/backend/deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/dm81}"
SERVICO="${SERVICO:-dm81}"

cd "$APP_DIR"

echo "==> Baixando as mudanças"
git pull --ff-only

echo "==> Dependências"
"$APP_DIR/backend/.venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"

echo "==> Estoque (js/data.js -> backend/data/estoque.json)"
if command -v node >/dev/null 2>&1; then
    node "$APP_DIR/backend/scripts/exportar_estoque.js"
else
    echo "    node não instalado; usando o estoque.json que veio do repositório"
fi

echo "==> Banco"
cd "$APP_DIR/backend"
"$APP_DIR/backend/.venv/bin/python" -c "from app.db import init_db; init_db()"

echo "==> Reiniciando o serviço"
sudo systemctl restart "$SERVICO"

echo "==> Conferindo"
sleep 3
curl -fsS http://127.0.0.1:8000/api/health && echo && echo "Deploy concluído."
