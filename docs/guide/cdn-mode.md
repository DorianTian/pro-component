# CDN 模式

Pro Components 支持通过 CDN + Import Maps 在浏览器中直接使用，无需构建工具。这使得组件版本可以独立于业务应用进行热更新。

## 工作原理

```
浏览器 → pro-loader.js → 请求 /api/import-map
  → 注入 import map（通过 es-module-shims）
  → modulepreload + CSS 注入
  → import(appEntry) 启动应用
```

## 快速集成

在 HTML 中添加一行 script 即可：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>

    <!-- 配置 -->
    <script>
      window.__PRO_USER_ID__ = 'your-user-id'
    </script>

    <!-- 一行接入 -->
    <script
      src="https://cdn.internal/pro-loader@1.js?appId=your-app-id"
      data-pro-entry="/src/main.ts"
    ></script>
  </body>
</html>
```

## Loader 加载流程

1. 加载 `es-module-shims` polyfill（支持动态 import map 注入）
2. 从 API 获取 import map（CDN 边缘缓存：`max-age=60, stale-while-revalidate=300`）
3. 失败时走降级链：API → Service Worker 缓存 → localStorage → 硬编码兜底 → 错误页面（带重试）
4. 注入 import map + modulepreload links + CSS links（含 SRI 完整性校验）
5. 注册/更新 Service Worker 用于离线兜底
6. `import(appEntry)` 启动应用

## Import Map 结构

API 返回的 import map 示例：

```json
{
  "imports": {
    "@pro/table": "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs",
    "@pro/form": "https://cdn.internal/@pro/form/1.1.2/esm/index.mjs",
    "@pro/hooks": "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "vue": "https://cdn.internal/vue/3.5.0/dist/vue.esm-browser.prod.js",
    "element-plus": "https://cdn.internal/element-plus/2.9.0/dist/index.full.mjs"
  },
  "preloads": ["https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"],
  "styles": [
    "https://cdn.internal/element-plus/2.9.0/dist/index.css",
    "https://cdn.internal/@pro/table/1.2.3/style/index.css"
  ]
}
```

## 开发环境对齐

CDN 模式下模块边界和 Vite 开发模式可能不一致，导致 `inject() can only be used inside setup()` 等问题。使用官方 Vite 插件解决：

```bash
pnpm add -D @pro/vite-plugin
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { proPlugin } from '@pro/vite-plugin'

export default defineConfig({
  plugins: [vue(), proPlugin()],
})
```

插件作用：

- 将 Vue、Element Plus、`@pro/*` 排除在 Vite 的 `optimizeDeps` 预打包之外
- 确保开发模式的模块边界与 CDN 生产模式一致

## 灰度发布

CDN 模式支持按用户、部门、百分比进行灰度发布。详见 [灰度发布指南](/platform/grayscale)。

## 缓存策略

| 资源类型              | Cache-Control                            | 说明                       |
| --------------------- | ---------------------------------------- | -------------------------- |
| 版本化静态资源        | `immutable, max-age=31536000`            | URL 包含版本号 + 内容 hash |
| API 响应              | `max-age=60, stale-while-revalidate=300` | CDN 边缘缓存               |
| Loader 脚本（版本化） | 长缓存                                   | `/pro-loader@1.js`         |
| Loader 脚本（latest） | 短缓存                                   | `/pro-loader@latest.js`    |

## 安全性

- 所有 CDN 资源附带 SRI（Subresource Integrity）hash 校验
- CDN 静态资源：`Access-Control-Allow-Origin: *`
- API 接口：白名单域名 + `credentials: include`
