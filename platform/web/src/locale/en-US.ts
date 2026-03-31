/**
 * English (US) locale messages for the Platform Dashboard.
 * Namespace: `dashboard.` to avoid collision with `pro.` component messages.
 */
export const enUS = {
  dashboard: {
    nav: {
      home: 'Dashboard',
      versions: 'Version Management',
      grayscale: 'Grayscale Rules',
      compatibility: 'Compatibility Matrix',
      settings: 'Settings',
    },
    stats: {
      totalPackages: 'Total Packages',
      activeVersions: 'Active Versions',
      recentReleases: 'Recent Releases',
      compatibilityIssues: 'Compatibility Issues',
    },
    table: {
      package: 'Package',
      version: 'Version',
      status: 'Status',
      published: 'Published',
      actions: 'Actions',
      ruleType: 'Rule Type',
      coverage: 'Coverage',
      targetVersion: 'Target Version',
    },
    status: {
      active: 'Active',
      grayscale: 'Grayscale',
      deprecated: 'Deprecated',
      yanked: 'Yanked',
      uploading: 'Uploading',
      propagating: 'Propagating',
      verifying: 'Verifying',
      failed: 'Failed',
    },
    actions: {
      publishNew: 'Publish New',
      createRule: 'Create Rule',
      saveRule: 'Save Rule',
      confirmRollback: 'Confirm Rollback',
      rollbackMessage: 'Are you sure you want to rollback to version {version}?',
      currentVersion: 'Current Active Version: {version}',
      appsAffected: 'Apps Affected: {count}',
    },
    ruleTypes: {
      userList: 'User List',
      department: 'Department',
      percentage: 'Percentage',
      composite: 'Composite',
    },
    compatibility: {
      compatible: 'Compatible',
      incompatible: 'Incompatible',
      untested: 'Untested',
      testing: 'Testing\u2026',
    },
    debug: {
      appId: 'App ID',
      userId: 'User ID (optional)',
      resolvedImportMap: 'Resolved Import Map',
      resolutionTrace: 'Resolution Trace',
      before: 'Before',
      after: 'After',
    },
  },
} as const
