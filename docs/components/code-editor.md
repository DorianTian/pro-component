---
outline: deep
---

# CodeEditor 代码编辑器

基于 Monaco Editor（VS Code 同源引擎）封装的代码编辑器，支持 13 种语言的语法高亮、智能提示、诊断校验。

## 基础用法

<demo vue="../../packages/code-editor/demos/basic.vue" />

## 多语言支持

支持 JavaScript、TypeScript、SQL、Python、Go、Bash、JSON、HTML、CSS、Markdown、YAML、XML。

<demo vue="../../packages/code-editor/demos/languages.vue" />

## 主题切换

内置 4 种主题：Light (vs)、Dark (vs-dark)、High Contrast Dark、High Contrast Light。

<demo vue="../../packages/code-editor/demos/themes.vue" />

## SQL 编辑器

适用于数据平台的 SQL 编辑场景，支持 toolbar 自定义扩展。

<demo vue="../../packages/code-editor/demos/sql.vue" />

## 只读模式

<demo vue="../../packages/code-editor/demos/readonly.vue" />

## 多标签页

VS Code 风格多文件标签页，每个 tab 独立的 model/viewState，切换时保留滚动位置和光标。

<demo vue="../../packages/code-editor/demos/tabs.vue" />

## Diff 对比

支持 side-by-side 和 inline 两种对比模式。

<demo vue="../../packages/code-editor/demos/diff.vue" />

## 全功能 Playground

所有参数可交互调整的完整演示。

<demo vue="../../packages/code-editor/demos/full-featured.vue" />

## API

### CodeEditor Props

| 属性                 | 类型             | 默认值        | 说明                 |
| -------------------- | ---------------- | ------------- | -------------------- |
| modelValue (v-model) | `string`         | `''`          | 编辑器内容           |
| language             | `EditorLanguage` | `'plaintext'` | 编程语言             |
| theme                | `EditorTheme`    | `'vs-dark'`   | 编辑器主题           |
| readOnly             | `boolean`        | `false`       | 只读模式             |
| minHeight            | `number`         | `200`         | 最小高度(px)         |
| maxHeight            | `number`         | `0`           | 最大高度(px)，0=不限 |
| lineNumbers          | `boolean`        | `true`        | 显示行号             |
| minimap              | `boolean`        | `false`       | 显示缩略图           |
| wordWrap             | `boolean`        | `false`       | 自动换行             |
| fontSize             | `number`         | `14`          | 字体大小(px)         |
| tabSize              | `number`         | `2`           | Tab 大小             |
| showToolbar          | `boolean`        | `true`        | 显示工具栏           |
| showStatusBar        | `boolean`        | `true`        | 显示状态栏           |
| autoFocus            | `boolean`        | `false`       | 自动聚焦             |

### CodeEditor Events

| 事件              | 参数              | 说明             |
| ----------------- | ----------------- | ---------------- |
| update:modelValue | `(value: string)` | 内容变更         |
| change            | `(value: string)` | 内容变更（同上） |

### CodeEditor Slots

| 插槽            | 说明               |
| --------------- | ------------------ |
| toolbar-left    | 工具栏左侧区域     |
| toolbar-right   | 工具栏右侧区域     |
| toolbar-actions | 工具栏额外操作按钮 |

### DiffEditor Props

| 属性       | 类型             | 默认值        | 说明              |
| ---------- | ---------------- | ------------- | ----------------- |
| original   | `string`         | —             | 原始内容（左侧）  |
| modified   | `string`         | —             | 修改内容（右侧）  |
| language   | `EditorLanguage` | `'plaintext'` | 编程语言          |
| theme      | `EditorTheme`    | `'vs-dark'`   | 主题              |
| sideBySide | `boolean`        | `true`        | 并排对比/行内对比 |
| minHeight  | `number`         | `300`         | 最小高度(px)      |
| readOnly   | `boolean`        | `true`        | 只读              |

### CodeEditorTabs Props

| 属性                | 类型          | 默认值      | 说明         |
| ------------------- | ------------- | ----------- | ------------ |
| tabs                | `EditorTab[]` | —           | 标签页定义   |
| activeKey (v-model) | `string`      | —           | 当前激活标签 |
| theme               | `EditorTheme` | `'vs-dark'` | 主题         |
| minHeight           | `number`      | `400`       | 最小高度(px) |
| closable            | `boolean`     | `false`     | 可关闭标签   |
| addable             | `boolean`     | `false`     | 可新增标签   |

### 类型定义

```typescript
type EditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'sql'
  | 'python'
  | 'go'
  | 'shell'
  | 'json'
  | 'html'
  | 'css'
  | 'markdown'
  | 'yaml'
  | 'xml'
  | 'plaintext'

type EditorTheme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'

interface EditorTab {
  key: string
  title: string
  language: EditorLanguage
  value: string
  readOnly?: boolean
}
```
