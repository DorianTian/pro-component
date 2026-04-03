<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-width: 480px">
    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        默认分隔符 /
      </span>
      <Breadcrumb>
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/settings">设置</BreadcrumbItem>
        <BreadcrumbItem>安全</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        箭头分隔符 >
      </span>
      <Breadcrumb separator=">">
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/settings">设置</BreadcrumbItem>
        <BreadcrumbItem>安全</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div>
      <span
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
      >
        横线分隔符 -
      </span>
      <Breadcrumb separator="-">
        <BreadcrumbItem to="/">首页</BreadcrumbItem>
        <BreadcrumbItem to="/settings">设置</BreadcrumbItem>
        <BreadcrumbItem>安全</BreadcrumbItem>
      </Breadcrumb>
    </div>
  </div>
</template>
