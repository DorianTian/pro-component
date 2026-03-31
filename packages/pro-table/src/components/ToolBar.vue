<script setup lang="ts">
import { inject, computed, type PropType, type VNode } from 'vue'
import { Refresh, DCaret, FullScreen } from '@element-plus/icons-vue'
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
  { label: t('pro.table.density.default'), value: 'default' },
  { label: t('pro.table.density.compact'), value: 'small' },
  { label: t('pro.table.density.relaxed'), value: 'large' },
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
      <!-- Custom action buttons -->
      <template
        v-for="(action, actionIndex) in toolbarActions"
        :key="`toolbar-action-${actionIndex}`"
      >
        <component :is="() => action" />
      </template>

      <el-divider v-if="toolbarActions.length > 0" direction="vertical" />

      <!-- Reload -->
      <el-tooltip content="Reload" placement="top">
        <span class="pro-toolbar__icon" @click="handleReload">
          <el-icon :size="18"><Refresh /></el-icon>
        </span>
      </el-tooltip>

      <!-- Density -->
      <el-dropdown v-if="isDensityVisible" trigger="click" @command="handleDensityChange">
        <span class="pro-toolbar__icon">
          <el-icon :size="18"><DCaret /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="opt in densityOptions"
              :key="opt.value"
              :command="opt.value"
              :class="{ 'is-active': currentDensity === opt.value }"
            >
              {{ opt.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- Column Setting (rendered via slot from ProTable, wraps the popover trigger) -->
      <slot v-if="isColumnSettingVisible" name="columnSetting" />

      <!-- Fullscreen -->
      <el-tooltip v-if="isFullscreenVisible" content="Fullscreen" placement="top">
        <span class="pro-toolbar__icon" @click="handleToggleFullscreen">
          <el-icon :size="18"><FullScreen /></el-icon>
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
  padding: var(--pro-spacing-md, 16px) 0;
}

.pro-toolbar__title {
  font-size: var(--pro-font-size-lg, 16px);
  font-weight: var(--pro-font-weight-semibold, 600);
  color: var(--el-text-color-primary, #303133);
  line-height: var(--pro-line-height-base, 1.5715);
}

.pro-toolbar__actions {
  display: flex;
  align-items: center;
  gap: var(--pro-spacing-xs, 4px);
}

.pro-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--pro-toolbar-icon-size, 32px);
  height: var(--pro-toolbar-icon-size, 32px);
  border-radius: var(--pro-radius-sm, 4px);
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  transition: all var(--pro-transition-duration, 0.2s) var(--pro-transition-easing, ease);
}

.pro-toolbar__icon:hover {
  color: var(--el-color-primary, #409eff);
  background: var(--pro-toolbar-icon-hover-bg, var(--el-fill-color-light, #f5f7fa));
}
</style>
