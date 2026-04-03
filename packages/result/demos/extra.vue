<script setup lang="ts">
import { ProResult } from '@pro/result'
import { ElButton } from 'element-plus'
</script>

<template>
  <ProResult
    type="error"
    title="导入失败"
    sub-title="文件格式不正确，请检查后重新上传。支持 .xlsx、.csv 格式。"
  >
    <template #extra>
      <ElButton type="primary">重新上传</ElButton>
      <ElButton>下载模板</ElButton>
      <ElButton>返回列表</ElButton>
    </template>
  </ProResult>
</template>
