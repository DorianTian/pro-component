<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { ElTabs, ElTabPane, ElInput, ElMessage } from 'element-plus'
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
  ElMessage.success({ message: `Copied: ${name}`, duration: 1500 })
  setTimeout(() => {
    copiedName.value = ''
  }, 1500)
}
</script>

<template>
  <div class="pro-icon-preview">
    <ElInput v-model="search" placeholder="搜索图标名称..." clearable style="margin-bottom: 16px" />

    <ElTabs v-model="activeTab" type="border-card">
      <ElTabPane
        v-for="cat in filteredCategories"
        :key="cat.name"
        :label="cat.label"
        :name="cat.name"
      >
        <div class="pro-icon-preview__grid">
          <div
            v-for="(comp, name) in cat.icons"
            :key="name"
            class="pro-icon-preview__card"
            :class="{ 'pro-icon-preview__card--active': copiedName === String(name) }"
            @click="handleCopy(String(name))"
          >
            <component :is="comp" :size="24" />
            <span class="pro-icon-preview__label">{{ name }}</span>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #999; text-align: right">
          {{ Object.keys(cat.icons).length }} icons
        </div>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style>
.pro-icon-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.pro-icon-preview__card {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 16px 8px 10px !important;
  border-radius: 8px !important;
  border: 1px solid #f0f0f0 !important;
  background: #fff !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  color: #333 !important;
}

.pro-icon-preview__card:hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pro-icon-preview__card--active {
  background: #ecf5ff !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

.pro-icon-preview__card--active .pro-icon-preview__label {
  color: #409eff !important;
}

.pro-icon-preview__label {
  font-size: 11px !important;
  color: #909399 !important;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
}
</style>
