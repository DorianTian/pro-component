<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@pro/switch'

const textOutside = ref(true)
const textInside = ref(true)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px; max-width: 380px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >外部文字描述</label
      >
      <Switch v-model="textOutside" active-text="开启" inactive-text="关闭" />
    </div>
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >内嵌文字描述</label
      >
      <Switch
        v-model="textInside"
        active-text="是"
        inactive-text="否"
        inline-prompt
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
      />
    </div>
  </div>
</template>
