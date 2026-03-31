<script setup lang="ts">
import { ref, inject, computed, type PropType, type VNode } from 'vue'
import { useProLocale } from '@pro/hooks'

import type { ToolbarConfig, DensitySize } from '../types'
import { DENSITY_INJECTION_KEY, COLUMN_SETTING_INJECTION_KEY, DEFAULT_DENSITY } from '../constants'

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
      <component v-else :is="() => headerTitle" />
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
        <el-button circle @click="handleReload">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Density -->
      <el-dropdown v-if="isDensityVisible" trigger="click" @command="handleDensityChange">
        <el-tooltip content="Density" placement="top">
          <el-button circle>
            <el-icon><DCaret /></el-icon>
          </el-button>
        </el-tooltip>
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
        <el-button circle @click="handleToggleColumnSetting">
          <el-icon><Setting /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- Fullscreen -->
      <el-tooltip v-if="isFullscreenVisible" content="Fullscreen" placement="top">
        <el-button circle @click="handleToggleFullscreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.pro-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--pro-toolbar-height, 48px);
  padding: var(--pro-toolbar-padding, 0 16px);
  margin-bottom: var(--pro-spacing-md, 16px);
}

.pro-toolbar__title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.pro-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
