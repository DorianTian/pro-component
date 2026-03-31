<template>
  <el-tag :type="tagType" :size="size" :effect="effect" round>
    <span class="status-dot" :style="{ backgroundColor: dotColor }" />
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface StatusConfig {
  type: StatusVariant
  color: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  active: { type: 'success', color: '#67c23a' },
  pass: { type: 'success', color: '#67c23a' },
  published: { type: 'success', color: '#67c23a' },
  publish: { type: 'success', color: '#67c23a' },
  verifying: { type: 'primary', color: '#409eff' },
  propagating: { type: 'warning', color: '#e6a23c' },
  uploading: { type: 'warning', color: '#e6a23c' },
  paused: { type: 'warning', color: '#e6a23c' },
  pin: { type: 'primary', color: '#409eff' },
  upgrade: { type: 'primary', color: '#409eff' },
  deprecated: { type: 'info', color: '#909399' },
  untested: { type: 'info', color: '#909399' },
  completed: { type: 'info', color: '#909399' },
  grayscale_start: { type: 'info', color: '#909399' },
  grayscale_complete: { type: 'success', color: '#67c23a' },
  failed: { type: 'danger', color: '#f56c6c' },
  fail: { type: 'danger', color: '#f56c6c' },
  yanked: { type: 'danger', color: '#f56c6c' },
  rollback: { type: 'danger', color: '#f56c6c' },
  deprecate: { type: 'warning', color: '#e6a23c' },
}

const DEFAULT_CONFIG: StatusConfig = { type: 'info', color: '#909399' }

const props = withDefaults(
  defineProps<{
    status: string
    size?: 'default' | 'small' | 'large'
    effect?: 'dark' | 'light' | 'plain'
  }>(),
  {
    size: 'small',
    effect: 'light',
  },
)

const config = computed<StatusConfig>(() => STATUS_MAP[props.status] ?? DEFAULT_CONFIG)
const tagType = computed(() => config.value.type)
const dotColor = computed(() => config.value.color)
const label = computed(() => props.status.charAt(0).toUpperCase() + props.status.slice(1))
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
</style>
