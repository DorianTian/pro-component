<script setup lang="ts">
import { ProEmpty } from '@pro/empty'
import { ElButton } from 'element-plus'
</script>

<template>
  <ProEmpty
    type="custom"
    description="暂无收藏内容，浏览发现页添加喜欢的内容"
    image="https://api.iconify.design/fluent-emoji-flat/star-struck.svg"
    :image-size="80"
  >
    <template #extra>
      <ElButton type="primary" size="small">去发现</ElButton>
    </template>
  </ProEmpty>
</template>
