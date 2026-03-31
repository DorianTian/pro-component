/**
 * Chinese (Simplified) locale messages for the Platform Dashboard.
 * Namespace: `dashboard.` to avoid collision with `pro.` component messages.
 */
export const zhCN = {
  dashboard: {
    nav: {
      home: '仪表盘',
      versions: '版本管理',
      grayscale: '灰度规则',
      compatibility: '兼容性矩阵',
      settings: '设置',
    },
    stats: {
      totalPackages: '总包数',
      activeVersions: '活跃版本',
      recentReleases: '近期发布',
      compatibilityIssues: '兼容性问题',
    },
    table: {
      package: '包名',
      version: '版本',
      status: '状态',
      published: '发布时间',
      actions: '操作',
      ruleType: '规则类型',
      coverage: '覆盖率',
      targetVersion: '目标版本',
    },
    status: {
      active: '活跃',
      grayscale: '灰度中',
      deprecated: '已废弃',
      yanked: '已撤回',
      uploading: '上传中',
      propagating: '传播中',
      verifying: '校验中',
      failed: '失败',
    },
    actions: {
      publishNew: '发布新版本',
      createRule: '创建规则',
      saveRule: '保存规则',
      confirmRollback: '确认回滚',
      rollbackMessage: '确定要回滚到版本 {version} 吗？',
      currentVersion: '当前活跃版本：{version}',
      appsAffected: '受影响应用：{count} 个',
    },
    ruleTypes: {
      userList: '用户列表',
      department: '部门',
      percentage: '百分比',
      composite: '组合规则',
    },
    compatibility: {
      compatible: '兼容',
      incompatible: '不兼容',
      untested: '未测试',
      testing: '测试中\u2026',
    },
    debug: {
      appId: '应用 ID',
      userId: '用户 ID（可选）',
      resolvedImportMap: '解析后的 Import Map',
      resolutionTrace: '解析链路',
      before: '变更前',
      after: '变更后',
    },
  },
} as const
