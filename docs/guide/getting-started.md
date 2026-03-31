# 快速上手

## 安装

::: code-group

```bash [pnpm]
pnpm add @pro/pro-components element-plus
```

```bash [npm]
npm install @pro/pro-components element-plus
```

```bash [yarn]
yarn add @pro/pro-components element-plus
```

:::

## 完整引入

在入口文件中全量注册：

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import ProComponents from '@pro/pro-components'
import 'element-plus/dist/index.css'
import '@pro/pro-components/style'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(ProComponents)
app.mount('#app')
```

## 按需引入

每个组件独立发包，可以单独安装和引入：

```bash
pnpm add @pro/table
```

```typescript
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { ProTable } from '@pro/table'
import 'element-plus/dist/index.css'
import '@pro/table/style'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.component('ProTable', ProTable)
app.mount('#app')
```

## 自动导入（推荐）

配合 [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) 实现自动按需导入：

```bash
pnpm add -D unplugin-vue-components @pro/resolvers
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ProComponentsResolver } from '@pro/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ProComponentsResolver()],
    }),
  ],
})
```

配置后可直接在模板中使用 `<ProTable />`，无需手动 import。

## 最小示例

```vue
<script setup lang="ts">
import type { ProColumnDef } from '@pro/utils'

const columns: ProColumnDef[] = [
  { dataIndex: 'id', title: 'ID', valueType: 'text' },
  { dataIndex: 'name', title: '姓名', valueType: 'text' },
  {
    dataIndex: 'status',
    title: '状态',
    valueType: 'select',
    valueEnum: {
      active: { text: '启用', status: 'success' },
      disabled: { text: '禁用', status: 'danger' },
    },
  },
]

const request = async (params: { current: number; pageSize: number }) => {
  const res = await fetch(`/api/users?page=${params.current}&size=${params.pageSize}`)
  const data = await res.json()
  return { data: data.list, total: data.total, success: true }
}
</script>

<template>
  <ProTable :columns="columns" :request="request" header-title="用户管理" row-key="id" />
</template>
```

## TypeScript 支持

Pro Components 使用 TypeScript 编写，提供完整的类型定义。所有类型从 `@pro/utils` 导出：

```typescript
import type { ProColumnDef, RequestParams, RequestResult, ValueType, StatusType } from '@pro/utils'
```

## 下一步

- [ProTable 组件文档](/components/pro-table) — 完整 API 和交互示例
- [CDN 模式](/guide/cdn-mode) — 无需构建直接在浏览器使用
- [Composable 模式](/composables/use-pro-table) — 完全控制组件状态
