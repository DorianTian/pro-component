#!/bin/bash
# Pro Components Docs — 部署脚本
# Usage: ssh -i ~/Downloads/aix-ops-hub-key.pem ubuntu@13.214.45.162 'bash -s' < deploy.sh
#
# 前置条件:
#   1. EC2 已安装 Node.js 20+, pnpm, Nginx
#   2. 首次部署需先 clone repo 到 APP_DIR

set -euo pipefail

APP_DIR="/opt/aix-ops-hub/pro-components"
LOG_DIR="/opt/aix-ops-hub/logs"

echo "=== Pro Components Docs Deploy ==="

# 1. Ensure directories
mkdir -p "$LOG_DIR"

# 2. Clone or pull
if [ ! -d "$APP_DIR" ]; then
    echo "📦 Cloning repo..."
    git clone git@github.com:DorianTian/pro-component.git "$APP_DIR"
fi

cd "$APP_DIR"
git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# 4. Build docs (VitePress static site)
echo "📦 Building docs..."
pnpm docs:build

# 5. Deploy nginx config (if not already linked)
NGINX_CONF="nginx/ui.askdorian.com"
if [ -f "$NGINX_CONF" ] && [ ! -f "/etc/nginx/sites-enabled/ui.askdorian.com" ]; then
    echo "🔧 Installing nginx config..."
    sudo cp "$NGINX_CONF" /etc/nginx/sites-available/ui.askdorian.com
    sudo ln -sf /etc/nginx/sites-available/ui.askdorian.com /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx config installed and reloaded"
elif [ -f "/etc/nginx/sites-enabled/ui.askdorian.com" ]; then
    echo "✅ Nginx config already active"
    sudo nginx -t && sudo systemctl reload nginx
fi

# 6. Health check
echo "⏳ Checking site..."
sleep 1
if curl -sf http://localhost/index.html -H "Host: ui.askdorian.com" > /dev/null 2>&1; then
    echo "✅ Site is live at ui.askdorian.com"
else
    echo "⚠️  Local health check failed — DNS may not be configured yet"
    echo "   Static files at: $APP_DIR/docs/.vitepress/dist/"
fi

echo ""
echo "✅ Deploy complete!"
echo ""
echo "Useful commands:"
echo "  ls $APP_DIR/docs/.vitepress/dist/ — 查看构建产物"
echo "  sudo nginx -t                     — 测试 nginx 配置"
echo "  sudo systemctl reload nginx       — 重载 nginx"
