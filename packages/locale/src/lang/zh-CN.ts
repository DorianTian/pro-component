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
    },
    descriptions: {
      empty: '\u2014',
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
