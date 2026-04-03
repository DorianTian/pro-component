<script setup lang="ts">
import { ProResult } from '@pro/result'
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px">
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult
        type="success"
        title="提交成功"
        sub-title="您的申请已提交，审核结果将在 3 个工作日内通知。"
      />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult type="error" title="提交失败" sub-title="网络连接异常，请稍后重试。" />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult
        type="warning"
        title="操作警告"
        sub-title="该操作将清空所有历史数据，请谨慎确认。"
      />
    </div>
    <div style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden">
      <ProResult
        type="info"
        title="系统公告"
        sub-title="平台将于本周六 02:00 ~ 06:00 进行维护升级。"
      />
    </div>
  </div>
</template>
