/**
 * Simplified Chinese locale messages for Pro Components.
 *
 * Key structure mirrors en-US.ts exactly.
 * All keys must have a corresponding entry in en-US.ts.
 */
export const zhCN = {
  pro: {
    table: {
      queryFilter: {
        search: '查询',
        reset: '重置',
        expand: '展开',
        collapse: '收起',
      },
      pagination: {
        showing: '显示 {start}\u2013{end}，共 {total} 条',
      },
      empty: '暂无数据',
      loading: '加载中\u2026',
      columnSetting: {
        title: '列设置',
        pinLeft: '固定到左侧',
        pinRight: '固定到右侧',
        unpin: '取消固定',
      },
      density: {
        compact: '紧凑',
        default: '默认',
        relaxed: '宽松',
      },
      toolbar: {
        reload: '刷新',
        fullscreen: '全屏',
      },
      editable: {
        edit: '编辑',
        save: '保存',
        cancel: '取消',
        delete: '删除',
        addRow: '新增一行',
        actions: '操作',
        deleteConfirm: '确定要删除这一行吗？',
      },
    },
    form: {
      submit: '提交',
      reset: '重置',
      cancel: '取消',
      steps: {
        prev: '上一步',
        next: '下一步',
        submit: '提交',
        stepOf: '第 {current} 步，共 {total} 步',
      },
      validation: {
        required: '{field} 为必填项',
        email: '邮箱格式不正确',
        minLength: '最少 {min} 个字符',
        maxLength: '最多 {max} 个字符',
      },
      select: {
        placeholder: '请选择\u2026',
      },
      date: {
        placeholder: '选择日期',
      },
      image: {
        placeholder: '图片链接',
      },
    },
    descriptions: {
      empty: '\u2014',
      switch: {
        on: '已开启',
        off: '已关闭',
      },
    },
    tree: {
      search: {
        placeholder: '搜索...',
      },
      expandAll: '全部展开',
      collapseAll: '全部收起',
    },
    loading: {
      empty: {
        description: '暂无数据',
      },
      error: {
        title: '加载失败',
        retry: '重试',
      },
    },
    tabs: {
      closeConfirm: {
        title: '确认',
        message: '确定要关闭此标签页吗？',
        ok: '确定',
        cancel: '取消',
      },
    },
    result: {
      success: {
        title: '操作成功',
        subtitle: '您的请求已成功处理。',
      },
      error: {
        title: '操作失败',
        subtitle: '出现错误，请重试。',
      },
      warning: {
        title: '警告',
        subtitle: '请检查以下信息。',
      },
      info: {
        title: '提示',
        subtitle: '',
      },
      http403: {
        title: '403 — 无访问权限',
        subtitle: '您没有权限访问此页面。',
      },
      http404: {
        title: '404 — 页面不存在',
        subtitle: '您访问的页面不存在。',
      },
      http500: {
        title: '500 — 服务器错误',
        subtitle: '服务器发生了意外错误。',
      },
    },
    empty: {
      noData: {
        description: '暂无数据',
      },
      noResult: {
        description: '无匹配结果',
      },
      error: {
        description: '数据加载失败',
      },
      noPermission: {
        description: '您没有权限查看此内容',
      },
      retry: '重试',
    },
    common: {
      confirm: '确认',
      close: '关闭',
      edit: '编辑',
      delete: '删除',
      view: '查看',
      create: '新建',
      update: '更新',
      save: '保存',
      success: '操作成功',
      networkError: '网络错误，请重试',
      timeout: '请求超时',
      required: '必填',
      noResults: '无匹配结果',
      loading: '加载中\u2026',
      yes: '是',
      no: '否',
      ok: '确定',
      retry: '重试',
      aria: {
        expand: '展开',
        collapse: '收起',
        required: '必填字段',
        error: '错误：{message}',
        close: '关闭',
      },
    },
  },
} as const
