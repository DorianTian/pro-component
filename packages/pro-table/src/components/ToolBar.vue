<script setup lang="ts">
import { ref, inject, computed, type PropType, type VNode } from 'vue'
import { Refresh, DCaret, Setting, FullScreen } from '@element-plus/icons-vue'
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

const isColumnSettingPanelOpen = ref(false)

function handleToggleColumnSetting(): void {
  isColumnSettingPanelOpen.value = !isColumnSettingPanelOpen.value
  emit('toggleColumnSetting')
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

      <!-- Column Setting -->
      <el-tooltip v-if="isColumnSettingVisible" content="Column Settings" placement="top">
        <span class="pro-toolbar__icon" @click="handleToggleColumnSetting">
          <el-icon :size="18"><Setting /></el-icon>
        </span>
      </el-tooltip>

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
  padding: 16px 0;
}

.pro-toolbar__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.pro-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pro-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary, #909399);
  transition: all 0.2s;
}

.pro-toolbar__icon:hover {
  color: var(--el-color-primary, #409eff);
  background: var(--el-fill-color-light, #f5f7fa);
}
</style>
