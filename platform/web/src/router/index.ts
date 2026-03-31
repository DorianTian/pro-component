import { createRouter, createWebHistory } from 'vue-router'

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    redirect: '/apps',
    children: [
      {
        path: 'apps',
        name: 'AppManage',
        component: () => import('@/views/app-manage/AppList.vue'),
        meta: { title: 'App Management', icon: 'Grid' },
      },
      {
        path: 'version-map',
        name: 'VersionMap',
        component: () => import('@/views/version-map/VersionMapList.vue'),
        meta: { title: 'Version Mapping', icon: 'Connection' },
      },
      {
        path: 'publish',
        name: 'Publish',
        component: () => import('@/views/publish/PublishList.vue'),
        meta: { title: 'Publish Management', icon: 'Upload' },
      },
      {
        path: 'grayscale',
        name: 'Grayscale',
        component: () => import('@/views/grayscale/GrayscaleList.vue'),
        meta: { title: 'Grayscale Strategy', icon: 'DataAnalysis' },
      },
      {
        path: 'compat',
        name: 'CompatMatrix',
        component: () => import('@/views/compat-matrix/CompatMatrix.vue'),
        meta: { title: 'Compatibility Matrix', icon: 'Checked' },
      },
      {
        path: 'changelog',
        name: 'Changelog',
        component: () => import('@/views/changelog/ChangelogView.vue'),
        meta: { title: 'Changelog', icon: 'Document' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) || 'Pro Components Platform'
  document.title = `${title} - Pro Components`
})

export { router }
