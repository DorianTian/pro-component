---
outline: deep
---

# API 参考

版本管理平台所有 API 均以 `/api/v1/` 为前缀，遵循 RESTful 规范。采用容错读取模式（tolerant reader）：未知字段忽略，不拒绝。

## Import Map（消费端）

### GET /api/v1/import-map

获取指定应用的 import map，CDN 边缘缓存。

**Query 参数：**

| 参数   | 类型   | 必填 | 说明                      |
| ------ | ------ | ---- | ------------------------- |
| appId  | string | 是   | 应用 ID                   |
| userId | string | 否   | 用户 ID，用于灰度命中判断 |

**响应示例：**

```json
{
  "imports": {
    "@pro/table": "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs",
    "@pro/hooks": "https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs",
    "vue": "https://cdn.internal/vue/3.5.0/dist/vue.esm-browser.prod.js",
    "element-plus": "https://cdn.internal/element-plus/2.9.0/dist/index.full.mjs"
  },
  "preloads": ["https://cdn.internal/@pro/hooks/1.2.0/esm/index.mjs"],
  "styles": [
    "https://cdn.internal/element-plus/2.9.0/dist/index.css",
    "https://cdn.internal/@pro/table/1.2.3/style/index.css"
  ],
  "sriHashes": {
    "https://cdn.internal/@pro/table/1.2.3/esm/index.mjs": "sha384-abc123..."
  },
  "cache_bust": false
}
```

## 版本管理

### POST /api/v1/versions/sync

npm publish hook 触发的版本同步。

**Request Body：**

```json
{
  "package": "@pro/table",
  "version": "1.2.3",
  "dependencies": { "@pro/hooks": "^1.2.0", "@pro/utils": "^1.0.0" },
  "peerDependencies": { "vue": ">=3.4.0", "element-plus": ">=2.9.0" },
  "changelog": "feat: add column pinning support",
  "breakingChanges": []
}
```

### GET /api/v1/versions/:package

获取包的所有版本列表。

### GET /api/v1/versions/:package/deps

获取包的完整依赖树。

## 应用管理

### POST /api/v1/apps

注册新应用。

```json
{
  "appId": "user-center",
  "name": "用户中心",
  "owner": "dorian"
}
```

### GET /api/v1/apps/:appId/versions

获取应用的版本映射。

### PUT /api/v1/apps/:appId/versions

更新应用的版本映射。

```json
{
  "versions": [
    { "package": "@pro/table", "versionRange": "^1.2.0" },
    { "package": "@pro/form", "pinnedVersion": "1.1.2" }
  ]
}
```

## 灰度管理

### POST /api/v1/grayscale

创建灰度规则。

```json
{
  "appId": "user-center",
  "packageId": 1,
  "targetVersion": "1.3.0-beta.1",
  "strategy": "composite",
  "ruleConfig": {
    "operator": "OR",
    "conditions": [
      { "type": "user_list", "values": ["uid1", "uid2"] },
      { "type": "percentage", "value": 10, "hash_key": "user_id" }
    ]
  }
}
```

### PUT /api/v1/grayscale/:id/pause

暂停灰度规则。

### PUT /api/v1/grayscale/:id/complete

灰度完成，提升为全量发布。

## 兼容性

### GET /api/v1/compat/:package

获取包的兼容性矩阵。

### POST /api/v1/compat/report

CI 自动上报测试结果。

```json
{
  "package": "@pro/table",
  "version": "1.2.3",
  "vueVersion": "3.5.0",
  "elementPlusVersion": "2.9.0",
  "status": "pass",
  "ciRunUrl": "https://github.com/your-org/pro-components/actions/runs/12345"
}
```

## 运维操作

### POST /api/v1/versions/:id/rollback

回滚版本。需要 admin 权限。

```json
{
  "targetVersion": "1.1.0",
  "reason": "v1.2.0 causes table pagination regression"
}
```

### POST /api/v1/versions/:id/deprecate

标记版本为废弃。

### GET /api/v1/apps/:id/resolution-graph

调试用：查看应用的依赖解析图。

## 健康检查

### GET /health/resolution

深度健康检查（无版本前缀）：DB + Redis + CDN 存储连通性。

```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "cdnStorage": "ok"
  },
  "timestamp": "2026-03-30T14:30:00Z"
}
```
