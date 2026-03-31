<template>
  <el-container class="dashboard-layout">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-header">
        <el-icon :size="24" color="#409eff"><Box /></el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="sidebar-title">Pro Components</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="appStore.sidebarCollapsed"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#409eff"
      >
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon>
            <component :is="route.meta?.icon" />
          </el-icon>
          <template #title>{{ route.meta?.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="dashboard-header">
        <div class="header-left">
          <el-icon class="collapse-trigger" :size="20" @click="appStore.toggleSidebar()">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <AppBreadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="28" icon="UserFilled" />
              <span class="username">{{ authStore.username || 'Guest' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-tag size="small" :type="roleTagType">{{ authStore.role }}</el-tag>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="dashboard-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import AppBreadcrumb from '@/components/Breadcrumb.vue'

const ROLE_TAG_TYPE_MAP: Record<string, string> = {
  admin: 'danger',
  operator: 'warning',
  publisher: 'success',
  viewer: 'info',
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

const menuRoutes = computed(() => {
  const dashboardRoute = router.getRoutes().find((r) => r.path === '/')
  return dashboardRoute?.children ?? []
})

const roleTagType = computed(() => {
  return ROLE_TAG_TYPE_MAP[authStore.role ?? 'viewer'] ?? 'info'
})

function handleLogout() {
  authStore.clearAuth()
  window.location.href = '/login'
}
</script>

<style scoped>
.dashboard-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #ffffff1a;
}

.sidebar-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-trigger {
  cursor: pointer;
  color: #606266;
}

.collapse-trigger:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.username {
  font-size: 14px;
}

.dashboard-main {
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
