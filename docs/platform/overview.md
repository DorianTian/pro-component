---
outline: deep
---

# 版本管理平台

版本管理平台是 Pro Components CDN 分发体系的控制中心，提供版本管理、灰度发布、兼容性矩阵和审计追踪功能。

## 架构

```
platform/
├── web/                   # Dashboard（Vue 3 + Element Plus）
│   └── views/
│       ├── app-manage/    # 业务应用管理
│       ├── version-map/   # 版本映射配置
│       ├── publish/       # 发布管理 & 灰度
│       ├── compat-matrix/ # 兼容性矩阵
│       └── changelog/     # 变更日志查看
└── server/                # API（Koa + MySQL）
    └── modules/
        ├── app/           # 应用 CRUD
        ├── version/       # 版本管理 & 依赖解析
        ├── import-map/    # Import Map 生成 & 缓存
        ├── grayscale/     # 灰度策略引擎
        └── sync/          # npm publish → CDN 同步
```

## 核心功能

### 应用管理

每个接入 CDN 分发的业务应用注册为一个 App，配置其依赖的 Pro Components 版本。

### 版本映射

控制每个 App 使用的各个 `@pro/*` 包版本。支持：

- **固定版本**（pin）：`1.2.3`
- **版本范围**（range）：`^1.2.0`
- **自动解析**：根据范围自动选择最新满足的版本

### 兼容性矩阵

CI 自动测试 Pro Components 与不同版本 Vue / Element Plus 的兼容性，结果上报至平台并可视化展示。

| 状态   | 含义           |
| ------ | -------------- |
| 通过   | 全部测试通过   |
| 失败   | 存在测试不通过 |
| 未测试 | 尚未执行测试   |

### 审计追踪

所有版本操作（发布、固定、升级、回滚、灰度）记录在 `version_events` 表中，包含操作人、时间、原因（回滚操作强制填写）。

## RBAC 权限

| 角色      | 权限范围                         |
| --------- | -------------------------------- |
| viewer    | 查看版本、兼容性矩阵、import map |
| publisher | CI 机器人，发布新版本            |
| operator  | 灰度管理、版本映射变更           |
| admin     | 回滚、废弃版本、用户管理         |

## 依赖解析

平台在生成 Import Map 时执行完整的依赖解析：

1. 收集请求包的所有 peer dependency 范围
2. 对每个共享依赖计算范围交集
3. 交集存在 → 选择最新满足版本
4. 无交集 → 返回冲突错误和升级建议

### 钻石依赖检测

当两个包依赖同一个包的不兼容版本时，平台会报错并提供升级建议：

```json
{
  "conflict": "element-plus",
  "required": {
    "@pro/table@2.0": "^2.4.0",
    "@pro/form@1.5": ">=2.2.0 <2.4.0"
  },
  "suggestion": "Upgrade @pro/form to 2.0"
}
```

## CDN 发布状态机

```
npm publish hook →
  uploading     → 上传 dist 到 CDN 存储 + 计算 SHA-384 hash
  propagating   → 等待 CDN 全球同步（轮询 3+ 边缘节点）
  verifying     → 从边缘节点加载并验证 hash 和 exports
  active        → 更新 API 版本映射（最后一步）
  failed        → 回滚、清理、通知发布者
```

版本映射更新始终是最后一步，确保 API 不会指向 CDN 上还不存在的文件。

## 部署

- 独立 CI/CD 管线，与组件库发布分离
- 蓝绿部署 + 深度健康检查（DB + Redis + CDN 存储连通性）
- 数据库迁移使用 expand-contract 模式
- API 版本化：`/api/v1/`, `/api/v2/`
