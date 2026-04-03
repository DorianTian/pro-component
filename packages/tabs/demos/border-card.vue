<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'

const activeTab = ref('tab1')
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      边框卡片风格，带底色背景
    </span>
    <ProTabs v-model="activeTab" variant="border-card">
      <ProTabPane label="基础信息" name="tab1">姓名、邮箱、手机号等基本字段</ProTabPane>
      <ProTabPane label="安全设置" name="tab2">密码修改、两步验证、登录日志</ProTabPane>
      <ProTabPane label="通知偏好" name="tab3">邮件通知、站内信、推送配置</ProTabPane>
    </ProTabs>
  </div>
</template>
