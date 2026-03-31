<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Version Mapping</h2>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form inline>
        <el-form-item label="App">
          <el-select
            v-model="selectedAppId"
            placeholder="Select an app"
            filterable
            style="width: 240px"
            @change="loadVersionMaps"
          >
            <el-option
              v-for="app in appStore.apps"
              :key="app.app_id"
              :label="`${app.name} (${app.app_id})`"
              :value="app.app_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="loadVersionMaps">Refresh</el-button>
          <el-button
            type="primary"
            :icon="View"
            :disabled="!selectedAppId"
            @click="showDepGraph = true"
          >
            Dependency Graph
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="selectedAppId" shadow="never" style="margin-top: 16px">
      <el-table v-loading="loading" :data="versionMaps" stripe style="width: 100%">
        <el-table-column prop="package_name" label="Package" width="200" />
        <el-table-column label="Pinned Version" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.pinned_version" type="success" size="small">
              {{ row.pinned_version }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column label="Version Range" width="160">
          <template #default="{ row }">
            <code v-if="row.version_range">{{ row.version_range }}</code>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column label="Resolved Version" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.resolved_version" size="small">
              {{ row.resolved_version }}
            </el-tag>
            <span v-else class="text-muted">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="Updated" width="180">
          <template #default="{ row }">
            {{ row.updated_at ? formatDate(row.updated_at) : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="Dependencies" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              :icon="Connection"
              @click="showDepsForPackage(row.package_name)"
            >
              Deps
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="authStore.hasPermission('operator')"
              size="small"
              type="primary"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-else description="Select an app to view version mappings" />

    <VersionEditDialog v-model="showEditDialog" :version-map="editingMap" @saved="handleSaved" />

    <el-dialog v-model="showDepGraph" title="Dependency Resolution Graph" width="80%" top="5vh">
      <DependencyGraph v-if="showDepGraph && selectedAppId" :app-id="selectedAppId" />
    </el-dialog>

    <el-dialog v-model="showPackageDeps" :title="`Dependencies: ${depsPackageName}`" width="60%">
      <div v-loading="depsLoading">
        <el-alert
          v-for="conflict in depsResult?.conflicts ?? []"
          :key="conflict.conflict"
          type="error"
          :closable="false"
          style="margin-bottom: 12px"
        >
          <template #title>
            Conflict: <strong>{{ conflict.conflict }}</strong>
          </template>
          <div>
            <div v-for="(range, pkg) in conflict.required" :key="pkg">
              {{ pkg }} requires <code>{{ range }}</code>
            </div>
            <div style="margin-top: 8px">Suggestion: {{ conflict.suggestion }}</div>
          </div>
        </el-alert>

        <el-tree
          v-if="depsResult?.tree"
          :data="[depsTreeData]"
          :props="{ children: 'children', label: 'label' }"
          default-expand-all
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Refresh, View, Connection } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { getAppVersions } from '@/api/apps'
import { getPackageDeps } from '@/api/versions'
import VersionEditDialog from './VersionEditDialog.vue'
import DependencyGraph from '@/components/DependencyGraph.vue'

import type { AppVersionMap, DependencyResolution, DependencyNode } from '@/api/types'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const selectedAppId = ref('')
const versionMaps = ref<AppVersionMap[]>([])
const loading = ref(false)
const showEditDialog = ref(false)
const editingMap = ref<AppVersionMap | null>(null)
const showDepGraph = ref(false)

const showPackageDeps = ref(false)
const depsPackageName = ref('')
const depsLoading = ref(false)
const depsResult = ref<DependencyResolution | null>(null)

interface TreeNode {
  label: string
  children: TreeNode[]
}

const depsTreeData = ref<TreeNode>({ label: '', children: [] })

async function loadVersionMaps() {
  if (!selectedAppId.value) return
  loading.value = true
  try {
    versionMaps.value = await getAppVersions(selectedAppId.value)
  } finally {
    loading.value = false
  }
}

function handleEdit(map: AppVersionMap) {
  editingMap.value = map
  showEditDialog.value = true
}

function handleSaved() {
  showEditDialog.value = false
  editingMap.value = null
  loadVersionMaps()
}

function depNodeToTree(node: DependencyNode): TreeNode {
  return {
    label: `${node.package}@${node.version}`,
    children: node.dependencies.map(depNodeToTree),
  }
}

async function showDepsForPackage(packageName: string) {
  depsPackageName.value = packageName
  showPackageDeps.value = true
  depsLoading.value = true
  depsResult.value = null
  try {
    const result = await getPackageDeps(packageName)
    depsResult.value = result
    if (result.tree) {
      depsTreeData.value = depNodeToTree(result.tree)
    }
  } finally {
    depsLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  const queryAppId = route.query.appId as string
  if (queryAppId) {
    selectedAppId.value = queryAppId
    loadVersionMaps()
  }
})
</script>

<style scoped>
.page-container {
  padding: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.text-muted {
  color: #c0c4cc;
}
</style>
