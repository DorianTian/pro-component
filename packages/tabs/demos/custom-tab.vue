<script setup lang="ts">
import { ref } from 'vue'
import { ProTabs, ProTabPane } from '@pro/tabs'
import { User, Setting, Bell } from '@element-plus/icons-vue'
</script>

<template>
  <div>
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      通过 label 插槽自定义标签内容（图标 + 文字）
    </span>
    <ProTabs model-value="tab1">
      <ProTabPane name="tab1">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px">
            <User style="width: 14px; height: 14px" />
            用户
          </span>
        </template>
        用户管理面板
      </ProTabPane>
      <ProTabPane name="tab2">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px">
            <Setting style="width: 14px; height: 14px" />
            设置
          </span>
        </template>
        系统设置面板
      </ProTabPane>
      <ProTabPane name="tab3">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px">
            <Bell style="width: 14px; height: 14px" />
            通知
          </span>
        </template>
        通知中心面板
      </ProTabPane>
    </ProTabs>
  </div>
</template>
