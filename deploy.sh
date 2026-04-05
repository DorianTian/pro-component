#!/bin/bash
# Pro Components Docs — 部署脚本
# 本地 build → scp 到 EC2 → nginx 托管静态文件
#
# Usage: ./deploy.sh
#
# 前置条件:
#   1. 本地已安装 pnpm, Node.js 18+
#   2. EC2 SSH 可达
#   3. Nginx 已安装并运行

set -euo pipefail

EC2_HOST="ubuntu@13.214.45.162"
SSH_KEY="$HOME/Downloads/aix-ops-hub-key.pem"
REMOTE_DIR="/opt/aix-ops-hub/pro-components-docs"
DIST_DIR="docs/.vitepress/dist"
NGINX_CONF="nginx/ui.askdorian.com"

echo "=== Pro Components Docs Deploy ==="

# 1. Build locally
echo "📦 Building docs locally..."
pnpm docs:build

if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Build failed — $DIST_DIR not found"
    exit 1
fi

echo "✅ Build complete ($(du -sh "$DIST_DIR" | cut -f1))"

# 2. Sync to EC2
echo "📤 Uploading to EC2..."
ssh -i "$SSH_KEY" "$EC2_HOST" "mkdir -p $REMOTE_DIR"
rsync -az --delete -e "ssh -i $SSH_KEY" "$DIST_DIR/" "$EC2_HOST:$REMOTE_DIR/"
echo "✅ Upload complete"

# 3. Deploy nginx config (if not already linked)
ssh -i "$SSH_KEY" "$EC2_HOST" bash -s <<'REMOTE_SCRIPT'
REMOTE_DIR="/opt/aix-ops-hub/pro-components-docs"
NGINX_NAME="ui.askdorian.com"

if [ ! -f "/etc/nginx/sites-enabled/$NGINX_NAME" ]; then
    echo "🔧 Installing nginx config..."
    sudo tee /etc/nginx/sites-available/$NGINX_NAME > /dev/null <<'NGINX_EOF'
# Pro Components Docs — ui.askdorian.com
server {
    listen 80;
    server_name ui.askdorian.com;

    root /opt/aix-ops-hub/pro-components-docs;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~ /\. { deny all; access_log off; log_not_found off; }

    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /hashmap.json {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    error_page 404 /404.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1024;
    gzip_vary on;
}
NGINX_EOF
    sudo ln -sf /etc/nginx/sites-available/$NGINX_NAME /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx config installed"
else
    echo "✅ Nginx config already active, reloading..."
    sudo nginx -t && sudo systemctl reload nginx
fi
REMOTE_SCRIPT

# 4. Health check
echo "⏳ Checking site..."
if ssh -i "$SSH_KEY" "$EC2_HOST" "curl -sf http://localhost/index.html -H 'Host: ui.askdorian.com'" > /dev/null 2>&1; then
    echo "�� Site is live at ui.askdorian.com"
else
    echo "⚠️  Health check pending — DNS may not be configured yet"
    echo "   Files deployed at: $EC2_HOST:$REMOTE_DIR/"
fi

echo ""
echo "✅ Deploy complete!"
