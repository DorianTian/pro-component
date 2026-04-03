<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      基础面包屑导航
    </span>
    <Breadcrumb>
      <BreadcrumbItem to="/">首页</BreadcrumbItem>
      <BreadcrumbItem to="/list">项目列表</BreadcrumbItem>
      <BreadcrumbItem>项目详情</BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
