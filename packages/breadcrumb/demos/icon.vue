<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
import { House, Setting, User } from '@element-plus/icons-vue'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      带图标的面包屑
    </span>
    <Breadcrumb>
      <BreadcrumbItem to="/">
        <el-icon style="vertical-align: middle; margin-right: 4px"><House /></el-icon>
        首页
      </BreadcrumbItem>
      <BreadcrumbItem to="/settings">
        <el-icon style="vertical-align: middle; margin-right: 4px"><Setting /></el-icon>
        系统设置
      </BreadcrumbItem>
      <BreadcrumbItem>
        <el-icon style="vertical-align: middle; margin-right: 4px"><User /></el-icon>
        用户管理
      </BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
