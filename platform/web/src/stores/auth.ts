import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { PlatformUser, UserRole } from '@/api/types'

/** LocalStorage key for JWT auth token */
const TOKEN_STORAGE_KEY = 'pro_platform_token'

/** Numeric privilege level per role -- higher = more permissions */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  publisher: 1,
  operator: 2,
  admin: 3,
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PlatformUser | null>(null)
  const token = ref(localStorage.getItem(TOKEN_STORAGE_KEY))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username ?? '')
  const role = computed<UserRole | null>(() => user.value?.role ?? null)

  function hasPermission(requiredRole: UserRole): boolean {
    if (!role.value) return false
    return ROLE_HIERARCHY[role.value] >= ROLE_HIERARCHY[requiredRole]
  }

  function setAuth(userData: PlatformUser, authToken: string) {
    user.value = userData
    token.value = authToken
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  return {
    user,
    token,
    isLoggedIn,
    username,
    role,
    hasPermission,
    setAuth,
    clearAuth,
  }
})

/**
 * Composable for role-based UI visibility.
 * Hides actions the current user doesn't have permission for.
 *
 * NOTE: All destructive action buttons (rollback, deprecate, delete) MUST be hidden
 * when the user lacks permission. Use `v-if="canRollback"` not `disabled`.
 * This prevents UI confusion where a button appears clickable but rejects on the server.
 */
export function usePermission() {
  const authStore = useAuthStore()

  const canPublish = computed(() => authStore.hasPermission('publisher'))
  const canManageGrayscale = computed(() => authStore.hasPermission('operator'))
  const canRollback = computed(() => authStore.role === 'admin')
  const canManageUsers = computed(() => authStore.role === 'admin')
  const canDeprecate = computed(() => authStore.role === 'admin')
  const canEditApp = computed(() => authStore.hasPermission('operator'))

  return {
    canPublish,
    canManageGrayscale,
    canRollback,
    canManageUsers,
    canDeprecate,
    canEditApp,
  }
}
