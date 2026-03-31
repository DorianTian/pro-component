---
outline: deep
---

# 灰度发布

灰度发布允许将新版本逐步推送给部分用户，在确认稳定后再全量发布。

## 策略类型

| 策略         | 说明               | 适用场景     |
| ------------ | ------------------ | ------------ |
| `user_list`  | 指定用户 ID 列表   | 内部测试人员 |
| `department` | 按部门推送         | 团队级试用   |
| `percentage` | 按百分比推送       | 逐步放量     |
| `composite`  | 组合策略（AND/OR） | 复杂场景     |

## 组合规则

支持 AND / OR 嵌套的复合规则：

```json
{
  "operator": "OR",
  "conditions": [
    { "type": "user_list", "values": ["uid1", "uid2"] },
    {
      "operator": "AND",
      "conditions": [
        { "type": "department", "values": ["engineering"] },
        { "type": "percentage", "value": 50, "hash_key": "user_id" }
      ]
    }
  ]
}
```

上面的规则含义：**uid1 或 uid2 命中灰度**，或者 **engineering 部门中 50% 的用户命中灰度**。

### 百分比策略的确定性

百分比策略使用 hash（而非随机数）确定用户分组：

```
hash(user_id + rule_id) % 100 < percentage → 命中灰度
```

同一用户在同一规则下每次请求都得到相同结果，避免页面刷新后版本跳变。

## 灰度流程

```
创建灰度规则 → active 状态
  ↓
观察期（监控错误率、性能指标）
  ↓
确认稳定 → 调用 complete 接口 → 全量发布
  ↓ 或
发现问题 → 调用 pause 接口 → 暂停灰度
  ↓
问题修复后 → 重新激活 或 新建灰度规则
```

## Dashboard 操作

在平台 Dashboard 的「发布管理」页面：

1. 选择目标应用和包
2. 选择要灰度的新版本
3. 配置灰度策略
4. 启动灰度
5. 在监控面板观察灰度用户的错误率和性能
6. 确认稳定后点击「全量发布」

## 回滚安全

回滚操作也走灰度流程 — 先对内部用户回滚，确认无问题后全量回滚：

1. 发起回滚前自动检查：目标版本的 CDN 资源是否仍存在？SRI hash 是否匹配？
2. 创建灰度规则，目标版本为回滚版本
3. API 响应包含 `cache_bust: true`，loader 检测到后清除 Service Worker 缓存
4. 审计日志记录回滚原因（必填）

## API 接口

```
POST /api/v1/grayscale                   # 创建灰度规则
PUT  /api/v1/grayscale/:id/pause         # 暂停灰度
PUT  /api/v1/grayscale/:id/complete      # 全量发布（灰度完成）
GET  /api/v1/apps/:appId/versions        # 查看应用版本映射
```

详细 API 参数见 [API 参考](/platform/api-reference)。
