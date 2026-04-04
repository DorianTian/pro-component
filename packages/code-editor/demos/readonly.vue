<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'
import { ElCheckbox } from 'element-plus'

const readOnly = ref(true)

const code = ref(`# Production Nginx Config — Read Only
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/api.pem;
    ssl_certificate_key /etc/ssl/private/api.key;

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <ElCheckbox v-model="readOnly" label="Read only" />
    </div>
    <CodeEditor v-model="code" language="shell" :read-only="readOnly" :min-height="300" />
  </div>
</template>
