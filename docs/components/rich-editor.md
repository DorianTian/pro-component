---
outline: deep
---

# RichEditor 富文本编辑器

基于 TipTap（ProseMirror）封装的企业级富文本编辑器，支持完整的格式化工具栏、表格、图片、代码块、任务列表等。

## 基础用法

完整工具栏 + 字数统计，开箱即用。

<demo vue="../../packages/editor/demos/basic.vue" />

## 只读模式

切换 `readOnly` 可在编辑模式和阅读模式之间切换，只读时工具栏自动隐藏。

<demo vue="../../packages/editor/demos/readonly.vue" />

## 字数限制

通过 `maxLength` 设置字符数上限，超出时底部计数器变红提示。

<demo vue="../../packages/editor/demos/character-limit.vue" />

## API

### RichEditor Props

| 属性                 | 类型              | 默认值               | 说明                 |
| -------------------- | ----------------- | -------------------- | -------------------- |
| modelValue (v-model) | `string`          | `''`                 | HTML 内容            |
| placeholder          | `string`          | `'Start writing...'` | 占位文本             |
| readOnly             | `boolean`         | `false`              | 只读模式             |
| maxLength            | `number`          | `0`                  | 最大字符数，0=不限   |
| minHeight            | `number`          | `200`                | 最小高度(px)         |
| maxHeight            | `number`          | `0`                  | 最大高度(px)，0=不限 |
| showToolbar          | `boolean`         | `true`               | 显示工具栏           |
| showWordCount        | `boolean`         | `true`               | 显示字数统计         |
| autoFocus            | `boolean`         | `false`              | 自动聚焦             |
| toolbar              | `ToolbarAction[]` | 全部                 | 工具栏按钮列表       |

### RichEditor Events

| 事件              | 参数             | 说明          |
| ----------------- | ---------------- | ------------- |
| update:modelValue | `(html: string)` | HTML 内容变更 |
| change            | `(html: string)` | 同上          |
| focus             | —                | 编辑器获焦    |
| blur              | —                | 编辑器失焦    |

### RichEditor Exposed

| 方法/属性        | 类型     | 说明                    |
| ---------------- | -------- | ----------------------- |
| getEditor()      | `Editor` | 获取 TipTap Editor 实例 |
| getHTML()        | `string` | 获取 HTML 内容          |
| getText()        | `string` | 获取纯文本内容          |
| getJSON()        | `object` | 获取 JSON 内容          |
| setContent(html) | `void`   | 设置 HTML 内容          |
| clearContent()   | `void`   | 清空内容                |
| focus()          | `void`   | 聚焦编辑器              |
| wordCount        | `number` | 当前词数                |
| charCount        | `number` | 当前字符数              |

### ToolbarAction 可选值

```typescript
type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'link'
  | 'image'
  | 'table'
  | 'color'
  | 'highlight'
  | 'undo'
  | 'redo'
```

### 自定义工具栏

只显示部分按钮：

```vue
<RichEditor
  v-model="content"
  :toolbar="['bold', 'italic', 'heading1', 'heading2', 'bulletList', 'link']"
/>
```
