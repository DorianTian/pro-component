---
outline: deep
---

# Select 选择器

基于 Element Plus `ElSelect` 的统一封装，默认启用 `clearable` 和 `filterable`。

## 默认配置

| 属性         | 默认值 | 说明           |
| ------------ | ------ | -------------- |
| `clearable`  | `true` | 默认可清除     |
| `filterable` | `true` | 默认可搜索过滤 |

## 基础用法

基本的选择器用法。

<demo vue="../../packages/select/demos/basic.vue" />

## 多选

设置 `multiple` 属性启用多选模式。

<demo vue="../../packages/select/demos/multiple.vue" />

## 禁用状态

通过 `disabled` 属性设置整个选择器或单个选项为禁用状态。

<demo vue="../../packages/select/demos/disabled.vue" />

## 不同尺寸

通过 `size` 属性控制选择器尺寸，可选值为 `large`、`default`、`small`。

<demo vue="../../packages/select/demos/sizes.vue" />

## 分组选项

使用 `ElOptionGroup` 对选项进行分组展示。

<demo vue="../../packages/select/demos/group.vue" />

## 远程搜索

设置 `remote` 和 `remote-method` 实现从服务端搜索数据。

<demo vue="../../packages/select/demos/remote.vue" />

## 自定义模板

通过 `ElOption` 的默认插槽自定义选项的渲染内容。

<demo vue="../../packages/select/demos/custom-template.vue" />

## 创建新选项

设置 `allow-create` 允许用户输入并创建新选项。

<demo vue="../../packages/select/demos/create.vue" />

## 对象值

设置 `value-key` 属性后可以将对象作为选项的值。

<demo vue="../../packages/select/demos/value-key.vue" />

## API

### Props

| 属性名                  | 说明                                      | 类型                                             | 默认值               |
| ----------------------- | ----------------------------------------- | ------------------------------------------------ | -------------------- |
| `model-value / v-model` | 绑定值                                    | `string \| number \| boolean \| object \| array` | —                    |
| `multiple`              | 是否多选                                  | `boolean`                                        | `false`              |
| `disabled`              | 是否禁用                                  | `boolean`                                        | `false`              |
| `size`                  | 尺寸                                      | `'large' \| 'default' \| 'small'`                | —                    |
| `clearable`             | 是否可清空                                | `boolean`                                        | `true`               |
| `collapse-tags`         | 多选时是否折叠标签                        | `boolean`                                        | `false`              |
| `collapse-tags-tooltip` | 悬浮时是否显示所有已选标签                | `boolean`                                        | `false`              |
| `multiple-limit`        | 多选时最多可选数量，`0` 为不限制          | `number`                                         | `0`                  |
| `placeholder`           | 占位文本                                  | `string`                                         | —                    |
| `filterable`            | 是否可搜索                                | `boolean`                                        | `true`               |
| `allow-create`          | 是否允许创建新选项                        | `boolean`                                        | `false`              |
| `remote`                | 是否远程搜索                              | `boolean`                                        | `false`              |
| `remote-method`         | 远程搜索方法                              | `(query: string) => void`                        | —                    |
| `loading`               | 是否正在加载                              | `boolean`                                        | `false`              |
| `loading-text`          | 加载时文本                                | `string`                                         | `'Loading'`          |
| `no-match-text`         | 无匹配时文本                              | `string`                                         | `'No matching data'` |
| `no-data-text`          | 无数据时文本                              | `string`                                         | `'No data'`          |
| `value-key`             | 作为 value 唯一标识的键名（对象值时使用） | `string`                                         | `'value'`            |
| `max-collapse-tags`     | 折叠标签最大显示数                        | `number`                                         | `1`                  |

### Events

| 事件名           | 说明                       | 参数                  |
| ---------------- | -------------------------- | --------------------- |
| `change`         | 选中值变化时触发           | `(value: any)`        |
| `visible-change` | 下拉框显示/隐藏时触发      | `(visible: boolean)`  |
| `remove-tag`     | 多选模式移除标签时触发     | `(tagValue: any)`     |
| `clear`          | 可清空模式下点击清除时触发 | —                     |
| `blur`           | 失去焦点时触发             | `(event: FocusEvent)` |
| `focus`          | 获取焦点时触发             | `(event: FocusEvent)` |

### Slots

| 插槽名    | 说明            |
| --------- | --------------- |
| `default` | Option 组件列表 |
| `prefix`  | 选择器前缀内容  |
| `empty`   | 无选项时的内容  |

完整属性参考 [Element Plus Select](https://element-plus.org/zh-CN/component/select.html)。
