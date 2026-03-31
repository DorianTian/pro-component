<script setup lang="ts">
import { inject, computed, type PropType, type VNode } from 'vue'
import { Refresh, FullScreen } from '@element-plus/icons-vue'
import { useProLocale } from '@pro/hooks'

import type { ToolbarConfig, DensitySize } from '../types'
import { DENSITY_INJECTION_KEY, DEFAULT_DENSITY } from '../constants'

defineOptions({ name: 'ProToolBar' })

const props = defineProps({
  headerTitle: {
    type: [String, Object] as PropType<string | VNode>,
    default: '',
  },
  toolbarActions: {
    type: Array as PropType<VNode[]>,
    default: () => [],
  },
  toolbar: {
    type: Object as PropType<ToolbarConfig>,
    default: () => ({}),
  },
})

const emit = defineEmits<{
  reload: []
  densityChange: [size: DensitySize]
  toggleFullscreen: []
  toggleColumnSetting: []
}>()

const isDensityVisible = computed(() => props.toolbar.density !== false)
const isColumnSettingVisible = computed(() => props.toolbar.columnSetting !== false)
const isFullscreenVisible = computed(() => props.toolbar.fullscreen === true)

const { t } = useProLocale()

const densityCtx = inject(DENSITY_INJECTION_KEY, null)
const currentDensity = computed(() => densityCtx?.size.value ?? DEFAULT_DENSITY)

const densityOptions = computed<{ label: string; value: DensitySize }[]>(() => [
  { label: t('pro.table.density.compact'), value: 'compact' },
  { label: t('pro.table.density.default'), value: 'default' },
  { label: t('pro.table.density.relaxed'), value: 'relaxed' },
])

function handleDensityChange(size: DensitySize): void {
  if (densityCtx) {
    densityCtx.size.value = size
  }
  emit('densityChange', size)
}

function handleReload(): void {
  emit('reload')
}

function handleToggleFullscreen(): void {
  emit('toggleFullscreen')
}
</script>

<template>
  <div class="pro-toolbar">
    <div class="pro-toolbar__title">
      <template v-if="typeof headerTitle === 'string'">
        <span>{{ headerTitle }}</span>
      </template>
      <component :is="() => headerTitle" v-else />
    </div>

    <div class="pro-toolbar__actions">
      <!-- Custom action buttons — slot takes priority over prop -->
      <slot name="actions">
        <template
          v-for="(action, actionIndex) in toolbarActions"
          :key="`toolbar-action-${actionIndex}`"
        >
          <component :is="() => action" />
        </template>
      </slot>

      <el-divider v-if="toolbarActions.length > 0" direction="vertical" />

      <!-- Reload -->
      <el-tooltip :content="t('pro.table.toolbar.reload')" placement="top">
        <span class="pro-toolbar__icon" @click="handleReload">
          <el-icon :size="16"><Refresh /></el-icon>
        </span>
      </el-tooltip>

      <!-- Density toggle (segmented control) -->
      <div v-if="isDensityVisible" class="pro-toolbar__density">
        <span
          v-for="opt in densityOptions"
          :key="opt.value"
          class="pro-toolbar__density-item"
          :class="{ 'is-active': currentDensity === opt.value }"
          @click="handleDensityChange(opt.value)"
        >
          {{ opt.label }}
        </span>
      </div>

      <el-divider v-if="isDensityVisible" direction="vertical" />

      <!-- Column Setting (rendered via slot from ProTable, wraps the popover trigger) -->
      <slot v-if="isColumnSettingVisible" name="columnSetting" />

      <!-- Fullscreen -->
      <el-tooltip
        v-if="isFullscreenVisible"
        :content="t('pro.table.toolbar.fullscreen')"
        placement="top"
      >
        <span class="pro-toolbar__icon" @click="handleToggleFullscreen">
          <el-icon :size="16"><FullScreen /></el-icon>
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.pro-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pro-space-4) var(--pro-space-7);
}

.pro-toolbar__title {
  font-size: var(--pro-text-md);
  font-weight: var(--pro-font-weight-semibold);
  color: var(--pro-text-primary);
  line-height: var(--pro-line-height-base);
}

.pro-toolbar__actions {
  display: flex;
  align-items: center;
  gap: var(--pro-space-2);
}

/* Toolbar icon buttons: 28×28 to match density control height */
.pro-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--pro-radius-xs);
  cursor: pointer;
  color: var(--pro-text-tertiary);
  transition: all var(--pro-transition-fast);
}

.pro-toolbar__icon:hover {
  color: var(--pro-color-primary);
  background: var(--pro-bg-sunken);
}

/* Vertical dividers between toolbar sections */
.pro-toolbar :deep(.el-divider--vertical) {
  height: 16px;
  margin: 0 var(--pro-space-2);
  border-color: var(--pro-border-light);
}

/* Density segmented control */
.pro-toolbar__density {
  display: inline-flex;
  align-items: center;
  background: var(--pro-bg-sunken);
  border-radius: var(--pro-radius-xs);
  padding: 2px;
  gap: 2px;
  height: 28px;
}

.pro-toolbar__density-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--pro-space-3);
  height: 22px;
  border-radius: 3px;
  font-size: var(--pro-text-xs);
  font-weight: var(--pro-font-weight-medium);
  color: var(--pro-text-tertiary);
  cursor: pointer;
  transition: all var(--pro-transition-fast);
  user-select: none;
  white-space: nowrap;
}

.pro-toolbar__density-item:hover {
  color: var(--pro-text-secondary);
}

.pro-toolbar__density-item.is-active {
  background: var(--pro-bg-elevated);
  color: var(--pro-color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
