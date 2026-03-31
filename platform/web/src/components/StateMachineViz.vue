<template>
  <div class="state-machine">
    <div v-for="(step, index) in STEPS" :key="step.state" class="state-step">
      <div
        class="state-node"
        :class="{
          'state-current': step.state === currentState,
          'state-completed': isCompleted(step.state),
          'state-failed': step.state === 'failed' && currentState === 'failed',
          'state-pending': isPending(step.state),
        }"
      >
        <el-icon v-if="isCompleted(step.state)" :size="20"><CircleCheckFilled /></el-icon>
        <el-icon
          v-else-if="step.state === currentState && currentState !== 'failed'"
          :size="20"
          class="is-loading"
          ><Loading
        /></el-icon>
        <el-icon v-else-if="step.state === 'failed' && currentState === 'failed'" :size="20"
          ><CircleCloseFilled
        /></el-icon>
        <span v-else class="state-number">{{ index + 1 }}</span>
      </div>
      <span class="state-label">{{ step.label }}</span>
      <div
        v-if="index < STEPS.length - 1"
        class="state-connector"
        :class="{ completed: isCompleted(step.state) }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CdnPublishState } from '@/api/types'

/** Ordered happy-path states for progression tracking */
const STATE_ORDER: CdnPublishState[] = ['uploading', 'propagating', 'verifying', 'active']

const STEPS = [
  { state: 'uploading' as const, label: 'Uploading' },
  { state: 'propagating' as const, label: 'Propagating' },
  { state: 'verifying' as const, label: 'Verifying' },
  { state: 'active' as const, label: 'Active' },
  { state: 'failed' as const, label: 'Failed' },
]

const props = defineProps<{
  currentState: CdnPublishState
}>()

function stateIndex(state: CdnPublishState): number {
  return STATE_ORDER.indexOf(state)
}

function isCompleted(state: CdnPublishState): boolean {
  if (state === 'failed') return false
  const current = stateIndex(props.currentState)
  const target = stateIndex(state)
  if (current === -1) return false
  return target < current || (state === 'active' && props.currentState === 'active')
}

function isPending(state: CdnPublishState): boolean {
  if (props.currentState === 'failed') return state !== 'failed'
  const current = stateIndex(props.currentState)
  const target = stateIndex(state)
  return target > current
}
</script>

<style scoped>
.state-machine {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 16px 0;
}

.state-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 100px;
}

.state-node {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #dcdfe6;
  background: #fff;
  color: #c0c4cc;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.state-node.state-current {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

.state-node.state-completed {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #67c23a;
}

.state-node.state-failed {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #f56c6c;
}

.state-label {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

.state-number {
  font-size: 12px;
}

.state-connector {
  position: absolute;
  top: 18px;
  left: calc(50% + 18px);
  width: calc(100% - 36px);
  height: 2px;
  background: #dcdfe6;
}

.state-connector.completed {
  background: #67c23a;
}
</style>
