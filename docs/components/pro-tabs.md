---
outline: deep
---

# ProTabs 增强标签页

基于 Element Plus `ElTabs` 的增强封装，支持关闭确认弹窗和 card 变体。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('tab1')
</script>

<template>
  <ProTabs v-model="activeTab">
    <ProTabPane label="用户管理" name="tab1">用户管理内容</ProTabPane>
    <ProTabPane label="角色管理" name="tab2">角色管理内容</ProTabPane>
    <ProTabPane label="权限配置" name="tab3">权限配置内容</ProTabPane>
  </ProTabs>
</template>
```

## Card 变体

```vue
<template>
  <ProTabs v-model="activeTab" variant="card">
    <ProTabPane label="Tab 1" name="tab1">Content 1</ProTabPane>
    <ProTabPane label="Tab 2" name="tab2">Content 2</ProTabPane>
  </ProTabs>
</template>
```

## 可关闭 + 确认弹窗

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('tab1')
const tabs = ref([
  { label: 'Tab 1', name: 'tab1' },
  { label: 'Tab 2', name: 'tab2' },
  { label: 'Tab 3', name: 'tab3' },
])

function handleRemove(name) {
  tabs.value = tabs.value.filter((t) => t.name !== name)
  if (activeTab.value === name) {
    activeTab.value = tabs.value[0]?.name ?? ''
  }
}
</script>

<template>
  <ProTabs v-model="activeTab" closable confirm-close @tab-remove="handleRemove">
    <ProTabPane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
      {{ tab.label }} 的内容
    </ProTabPane>
  </ProTabs>
</template>
```

## API

### Props

| 属性             | 类型                                | 默认值              | 说明                      |
| ---------------- | ----------------------------------- | ------------------- | ------------------------- |
| `modelValue`     | `string`                            | —                   | 当前激活标签页（v-model） |
| `variant`        | `'line' \| 'card' \| 'border-card'` | `'line'`            | 标签页风格                |
| `closable`       | `boolean`                           | `false`             | 是否可关闭                |
| `confirmClose`   | `boolean`                           | `false`             | 关闭前是否弹出确认框      |
| `confirmMessage` | `string`                            | `'Are you sure...'` | 确认弹窗文案              |
| `confirmTitle`   | `string`                            | `'Confirm'`         | 确认弹窗标题              |

其余 Props 同 [Element Plus Tabs](https://element-plus.org/zh-CN/component/tabs.html)。

### Events

| 事件                | 参数              | 说明                     |
| ------------------- | ----------------- | ------------------------ |
| `update:modelValue` | `(value: string)` | 切换标签页               |
| `tab-remove`        | `(name: string)`  | 关闭标签页（确认后触发） |
| `tab-click`         | `(pane, event)`   | 点击标签页               |
