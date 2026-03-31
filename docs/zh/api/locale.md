# Locale API

## @pro/locale

`@pro/locale` 包提供 Pro Components 的所有翻译消息。

### 导出

```ts
import { enUS, zhCN } from '@pro/locale'
import type { ProLocaleKey } from '@pro/locale'
```

| 导出           | 类型     | 说明                                       |
| -------------- | -------- | ------------------------------------------ |
| `enUS`         | `object` | 英文 (US) 消息对象                         |
| `zhCN`         | `object` | 简体中文消息对象                           |
| `ProLocaleKey` | `type`   | 所有合法的 dot-separated 消息 key 联合类型 |

## useProLocale

从最近的 `<ProConfigProvider>` 获取 locale 上下文的 composable。

```ts
import { useProLocale } from '@pro/hooks'

const { t, locale } = useProLocale()
```

### 返回值

| 属性     | 类型                                                                       | 说明                               |
| -------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `t`      | `(key: ProLocaleKey, params?: Record<string, string \| number>) => string` | 翻译函数                           |
| `locale` | `ComputedRef<string>`                                                      | 当前 locale 字符串（如 `'zh-CN'`） |

### Fallback 行为

当没有 `<ProConfigProvider>` 时，`useProLocale()` 返回一个使用内置 en-US 消息和 `resolveMessage()` 作为翻译器的 fallback 上下文。

## ProConfigProvider

Locale 配置的唯一入口。

```vue
<template>
  <ProConfigProvider locale="zh-CN">
    <App />
  </ProConfigProvider>
</template>
```

### Props

| Prop      | 类型                                  | 默认值      | 说明                                                |
| --------- | ------------------------------------- | ----------- | --------------------------------------------------- |
| `locale`  | `string`                              | `'en-US'`   | 当前 locale。同步 vue-i18n、Element Plus 和 dayjs。 |
| `density` | `'compact' \| 'default' \| 'relaxed'` | `'default'` | 组件密度                                            |
| `theme`   | `'light' \| 'dark'`                   | `'light'`   | 主题模式                                            |

### Locale 同步机制

设置 `locale` prop 会自动同步三套系统：

1. **vue-i18n** global locale（如已安装）
2. **Element Plus** locale（通过包裹的 `ElConfigProvider`）
3. **dayjs** locale（日期格式化）

## 消息 Key 参考

所有 key 都嵌套在 `pro.` 命名空间下。

### pro.table

| Key                                | en-US                             | zh-CN                              |
| ---------------------------------- | --------------------------------- | ---------------------------------- |
| `pro.table.queryFilter.search`     | Search                            | 查询                               |
| `pro.table.queryFilter.reset`      | Reset                             | 重置                               |
| `pro.table.queryFilter.expand`     | Expand                            | 展开                               |
| `pro.table.queryFilter.collapse`   | Collapse                          | 收起                               |
| `pro.table.pagination.showing`     | Showing {start}--{end} of {total} | 显示 {start}--{end}，共 {total} 条 |
| `pro.table.empty`                  | No Data                           | 暂无数据                           |
| `pro.table.loading`                | Loading...                        | 加载中...                          |
| `pro.table.columnSetting.title`    | Columns                           | 列设置                             |
| `pro.table.columnSetting.pinLeft`  | Pin Left                          | 固定到左侧                         |
| `pro.table.columnSetting.pinRight` | Pin Right                         | 固定到右侧                         |
| `pro.table.columnSetting.unpin`    | Unpin                             | 取消固定                           |
| `pro.table.density.compact`        | Compact                           | 紧凑                               |
| `pro.table.density.default`        | Default                           | 默认                               |
| `pro.table.density.relaxed`        | Relaxed                           | 宽松                               |

### pro.form

| Key                             | en-US                     | zh-CN                          |
| ------------------------------- | ------------------------- | ------------------------------ |
| `pro.form.submit`               | Submit                    | 提交                           |
| `pro.form.reset`                | Reset                     | 重置                           |
| `pro.form.cancel`               | Cancel                    | 取消                           |
| `pro.form.steps.prev`           | Previous                  | 上一步                         |
| `pro.form.steps.next`           | Next                      | 下一步                         |
| `pro.form.steps.submit`         | Submit                    | 提交                           |
| `pro.form.steps.stepOf`         | Step {current} of {total} | 第 {current} 步，共 {total} 步 |
| `pro.form.validation.required`  | {field} is required       | {field} 为必填项               |
| `pro.form.validation.email`     | Invalid email format      | 邮箱格式不正确                 |
| `pro.form.validation.minLength` | Minimum {min} characters  | 最少 {min} 个字符              |
| `pro.form.validation.maxLength` | Maximum {max} characters  | 最多 {max} 个字符              |
| `pro.form.select.placeholder`   | Please select...          | 请选择...                      |
| `pro.form.date.placeholder`     | Select date               | 选择日期                       |

### pro.descriptions

| Key                      | en-US | zh-CN |
| ------------------------ | ----- | ----- |
| `pro.descriptions.empty` | ---   | ---   |

### pro.common

| Key                       | en-US                           | zh-CN            |
| ------------------------- | ------------------------------- | ---------------- |
| `pro.common.confirm`      | Confirm                         | 确认             |
| `pro.common.close`        | Close                           | 关闭             |
| `pro.common.edit`         | Edit                            | 编辑             |
| `pro.common.delete`       | Delete                          | 删除             |
| `pro.common.view`         | View                            | 查看             |
| `pro.common.create`       | Create                          | 新建             |
| `pro.common.update`       | Update                          | 更新             |
| `pro.common.save`         | Save                            | 保存             |
| `pro.common.success`      | Operation successful            | 操作成功         |
| `pro.common.networkError` | Network error, please try again | 网络错误，请重试 |
| `pro.common.timeout`      | Request timeout                 | 请求超时         |
| `pro.common.required`     | Required                        | 必填             |
| `pro.common.noResults`    | No results found                | 无匹配结果       |
| `pro.common.loading`      | Loading...                      | 加载中...        |

### pro.common.aria

| Key                        | en-US            | zh-CN           |
| -------------------------- | ---------------- | --------------- |
| `pro.common.aria.expand`   | Expand           | 展开            |
| `pro.common.aria.collapse` | Collapse         | 收起            |
| `pro.common.aria.required` | Required field   | 必填字段        |
| `pro.common.aria.error`    | Error: {message} | 错误：{message} |
| `pro.common.aria.close`    | Close            | 关闭            |
