import axios from 'axios'
import { ElMessage } from 'element-plus'

import type { ApiResponse } from './types'

/** HTTP request timeout for API calls (ms) */
const API_TIMEOUT_MS = 15_000
/** LocalStorage key for JWT auth token */
const TOKEN_STORAGE_KEY = 'pro_platform_token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** HTTP status codes with special handling */
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR_THRESHOLD: 500,
} as const

/**
 * Global error handler for API failures.
 * Shows user-friendly messages and handles auth expiry.
 *
 * Error recovery strategy:
 * - 401: Clear token and redirect to login (session expired)
 * - 403: Show permission denied message (role insufficient)
 * - 5xx: Show generic server error with retry suggestion
 * - Network error: Show connectivity message
 * - Other 4xx: Show server-provided error message
 */
function handleApiError(error: unknown): void {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      window.location.href = '/login'
      return
    }

    if (status === HTTP_STATUS.FORBIDDEN) {
      ElMessage.error('Permission denied')
      return
    }

    if (status !== undefined && status >= HTTP_STATUS.SERVER_ERROR_THRESHOLD) {
      ElMessage.error('Server error -- please try again later')
      return
    }

    const message = (error.response?.data as Record<string, unknown> | undefined)?.message
    ElMessage.error(typeof message === 'string' ? message : 'Request failed')
    return
  }

  ElMessage.error('Network error -- check your connection')
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    handleApiError(error)
    return Promise.reject(error)
  },
)

/**
 * Typed GET request -- unwraps the ApiResponse envelope.
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params })
  return response.data.data
}

/**
 * Typed POST request -- unwraps the ApiResponse envelope.
 */
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data)
  return response.data.data
}

/**
 * Typed PUT request -- unwraps the ApiResponse envelope.
 */
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data)
  return response.data.data
}

/**
 * Typed DELETE request -- unwraps the ApiResponse envelope.
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url)
  return response.data.data
}

export { apiClient, handleApiError }
