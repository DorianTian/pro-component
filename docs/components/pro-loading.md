---
outline: deep
---

# ProLoading 加载状态

声明式状态机组件，根据 `loading`、`empty`、`error` 三个 prop 自动切换对应的 UI 状态。优先级：loading > error > empty > success。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'

const loading = ref(true)
const data = ref([])
const error = ref(null)

// 模拟请求
setTimeout(() => {
  loading.value = false
  data.value = [{ id: 1, name: 'Item 1' }]
}, 2000)
</script>

<template>
  <ProLoading :loading="loading" :empty="data.length === 0" :error="error" @retry="fetchData">
    <ul>
      <li v-for="item in data" :key="item.id">{{ item.name }}</li>
    </ul>
  </ProLoading>
</template>
```

## 各状态展示

```vue
<template>
  <!-- Loading 状态 -->
  <ProLoading :loading="true" />

  <!-- Empty 状态 -->
  <ProLoading :loading="false" :empty="true" empty-description="暂无数据" />

  <!-- Error 状态 -->
  <ProLoading :loading="false" :error="'网络请求失败'" @retry="handleRetry" />
</template>
```

## 自定义插槽

```vue
<template>
  <ProLoading :loading="isLoading" :empty="isEmpty" :error="error">
    <template #loading>
      <MySkeleton />
    </template>
    <template #empty>
      <ProEmpty type="no-result" description="没有匹配结果" />
    </template>
    <template #error="{ error: msg, retry }">
      <div>{{ msg }}</div>
      <el-button @click="retry">重新加载</el-button>
    </template>
    <MyContent />
  </ProLoading>
</template>
```

## API

### Props

| 属性               | 类型                      | 默认值                   | 说明             |
| ------------------ | ------------------------- | ------------------------ | ---------------- |
| `loading`          | `boolean`                 | `false`                  | 是否加载中       |
| `empty`            | `boolean`                 | `false`                  | 数据是否为空     |
| `error`            | `string \| Error \| null` | `null`                   | 错误信息         |
| `skeletonRows`     | `number`                  | `4`                      | 默认骨架屏行数   |
| `animated`         | `boolean`                 | `true`                   | 骨架屏是否带动画 |
| `emptyDescription` | `string`                  | `'No data'`              | 空状态描述       |
| `errorTitle`       | `string`                  | `'Something went wrong'` | 错误状态标题     |

### Events

| 事件    | 说明               |
| ------- | ------------------ |
| `retry` | 点击重试按钮时触发 |

### Slots

| 插槽      | 参数                                   | 说明               |
| --------- | -------------------------------------- | ------------------ |
| `default` | —                                      | 成功状态展示的内容 |
| `loading` | —                                      | 自定义加载状态     |
| `empty`   | —                                      | 自定义空状态       |
| `error`   | `{ error: string, retry: () => void }` | 自定义错误状态     |
