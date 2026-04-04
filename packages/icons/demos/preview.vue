<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { ElTabs, ElTabPane, ElInput, ElTooltip } from 'element-plus'
import * as NavigationIcons from '../src/categories/navigation'
import * as ActionIcons from '../src/categories/action'
import * as StatusIcons from '../src/categories/status'
import * as DataIcons from '../src/categories/data'
import * as UserIcons from '../src/categories/user'
import * as FileIcons from '../src/categories/file'
import * as CommunicationIcons from '../src/categories/communication'
import * as CommerceIcons from '../src/categories/commerce'
import * as EditorIcons from '../src/categories/editor'

interface IconCategory {
  label: string
  name: string
  icons: Record<string, Component>
}

const categories: IconCategory[] = [
  { label: '导航 Navigation', name: 'navigation', icons: NavigationIcons },
  { label: '操作 Action', name: 'action', icons: ActionIcons },
  { label: '状态 Status', name: 'status', icons: StatusIcons },
  { label: '数据 Data', name: 'data', icons: DataIcons },
  { label: '用户 User', name: 'user', icons: UserIcons },
  { label: '文件 File', name: 'file', icons: FileIcons },
  { label: '通信 Communication', name: 'communication', icons: CommunicationIcons },
  { label: '商务 Commerce', name: 'commerce', icons: CommerceIcons },
  { label: '编辑器 Editor', name: 'editor', icons: EditorIcons },
]

const activeTab = ref('navigation')
const search = ref('')
const copiedName = ref('')

const filteredCategories = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return categories
  return categories
    .map((cat) => ({
      ...cat,
      icons: Object.fromEntries(
        Object.entries(cat.icons).filter(([name]) => name.toLowerCase().includes(q)),
      ),
    }))
    .filter((cat) => Object.keys(cat.icons).length > 0)
})

function handleCopy(name: string): void {
  navigator.clipboard.writeText(name)
  copiedName.value = name
  setTimeout(() => {
    copiedName.value = ''
  }, 1500)
}
</script>

<template>
  <div class="icon-preview">
    <ElInput v-model="search" placeholder="搜索图标名称..." clearable style="margin-bottom: 16px" />

    <ElTabs v-model="activeTab" type="border-card">
      <ElTabPane
        v-for="cat in filteredCategories"
        :key="cat.name"
        :label="cat.label"
        :name="cat.name"
      >
        <div class="icon-preview__grid">
          <ElTooltip
            v-for="(comp, name) in cat.icons"
            :key="name"
            :content="copiedName === name ? 'Copied!' : name"
            placement="top"
          >
            <div
              class="icon-preview__item"
              :class="{ 'icon-preview__item--copied': copiedName === name }"
              @click="handleCopy(String(name))"
            >
              <component :is="comp" :size="22" class="icon-preview__icon" />
              <span class="icon-preview__name">{{ name }}</span>
            </div>
          </ElTooltip>
        </div>
        <div class="icon-preview__count">{{ Object.keys(cat.icons).length }} icons</div>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style>
.icon-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}

.icon-preview__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.icon-preview__item:hover {
  background: var(--pro-bg-sunken, #f5f5f5);
  border-color: var(--pro-border-light, #e5e5e5);
}

.icon-preview__item--copied {
  background: var(--pro-color-primary-ultra-light, #ecf5ff) !important;
  border-color: var(--pro-color-primary, #409eff) !important;
}

.icon-preview__icon {
  color: var(--pro-text-primary, #1f2937);
}

.icon-preview__name {
  font-size: 11px;
  color: var(--pro-text-tertiary, #999);
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
}

.icon-preview__count {
  margin-top: 12px;
  font-size: 12px;
  color: var(--pro-text-quaternary, #bbb);
  text-align: right;
}
</style>
