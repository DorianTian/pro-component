<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { Rate } from '@pro/rate'
import { ChatDotRound, ChatLineRound, ChatRound } from '@element-plus/icons-vue'

const value = ref(3)

const icons = [markRaw(ChatRound), markRaw(ChatLineRound), markRaw(ChatDotRound)]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >自定义图标</label
    >
    <Rate
      v-model="value"
      :icons="icons"
      :void-icon="ChatRound"
      :colors="['#409eff', '#67c23a', '#FF9900']"
    />
  </div>
</template>
