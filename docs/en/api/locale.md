# Locale API

## @pro/locale

The `@pro/locale` package provides all translation messages for Pro Components.

### Exports

```ts
import { enUS, zhCN } from '@pro/locale'
import type { ProLocaleKey } from '@pro/locale'
```

| Export         | Type     | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| `enUS`         | `object` | English (US) message object                        |
| `zhCN`         | `object` | Chinese (Simplified) message object                |
| `ProLocaleKey` | `type`   | Union type of all valid dot-separated message keys |

## useProLocale

Composable that provides locale context from the nearest `<ProConfigProvider>`.

```ts
import { useProLocale } from '@pro/hooks'

const { t, locale } = useProLocale()
```

### Return Value

| Property | Type                                                                       | Description                             |
| -------- | -------------------------------------------------------------------------- | --------------------------------------- |
| `t`      | `(key: ProLocaleKey, params?: Record<string, string \| number>) => string` | Translation function                    |
| `locale` | `ComputedRef<string>`                                                      | Current locale string (e.g., `'en-US'`) |

### Fallback Behavior

When no `<ProConfigProvider>` is present, `useProLocale()` returns a fallback context using built-in en-US messages and `resolveMessage()` as the translator.

## ProConfigProvider

The single entry point for locale configuration.

```vue
<template>
  <ProConfigProvider locale="zh-CN">
    <App />
  </ProConfigProvider>
</template>
```

### Props

| Prop      | Type                                  | Default     | Description                                             |
| --------- | ------------------------------------- | ----------- | ------------------------------------------------------- |
| `locale`  | `string`                              | `'en-US'`   | Active locale. Syncs vue-i18n, Element Plus, and dayjs. |
| `density` | `'compact' \| 'default' \| 'relaxed'` | `'default'` | Component density                                       |
| `theme`   | `'light' \| 'dark'`                   | `'light'`   | Theme mode                                              |

### Locale Synchronization

Setting the `locale` prop synchronizes three systems automatically:

1. **vue-i18n** global locale (if installed)
2. **Element Plus** locale via `ElConfigProvider`
3. **dayjs** locale for date formatting

## Message Key Reference

All keys are nested under the `pro.` namespace.

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
