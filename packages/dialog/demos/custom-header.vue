<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@pro/dialog'
import { ElButton, ElTag } from 'element-plus'

const visible = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 480px">
    <span
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
    >
      自定义头部 — 通过 header 插槽自定义标题区域
    </span>
    <ElButton @click="visible = true">自定义头部</ElButton>
    <Dialog v-model="visible" width="460px">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <span style="font-size: 16px; font-weight: 600">订单详情</span>
          <ElTag type="success" size="small">已完成</ElTag>
        </div>
      </template>
      <div style="line-height: 1.8; color: #666">
        <p>订单编号：ORD-2026-00421</p>
        <p>下单时间：2026-04-03 14:30:00</p>
        <p>商品名称：Pro Components 企业授权</p>
        <p>订单金额：¥ 12,800.00</p>
      </div>
      <template #footer>
        <ElButton @click="visible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>
