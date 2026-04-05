# Pro Components Docs — ui.askdorian.com
# Deploy: scp to /etc/nginx/sites-available/ui.askdorian.com
# Enable: sudo ln -sf /etc/nginx/sites-available/ui.askdorian.com /etc/nginx/sites-enabled/
# Cloudflare: A record → ui → EC2 Elastic IP (Proxied)

server {
    listen 80;
    server_name ui.askdorian.com;

    root /opt/aix-ops-hub/pro-components/docs/.vitepress/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Block dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # VitePress hashed assets — long cache
    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # VitePress hashmap.json — no cache
    location = /hashmap.json {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA fallback — VitePress generates clean URLs
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # Custom 404
    error_page 404 /404.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1024;
    gzip_vary on;
}
