<script setup lang="ts">
import { ProEmpty } from '@pro/empty'
import { ElTable, ElTableColumn, ElButton } from 'element-plus'
</script>

<template>
  <ElTable :data="[]" style="width: 100%">
    <ElTableColumn prop="name" label="名称" />
    <ElTableColumn prop="status" label="状态" />
    <ElTableColumn prop="createTime" label="创建时间" />
    <template #empty>
      <ProEmpty type="no-result" description="没有匹配的数据，请调整筛选条件" :image-size="80">
        <template #extra>
          <ElButton size="small">清除筛选</ElButton>
        </template>
      </ProEmpty>
    </template>
  </ElTable>
</template>
