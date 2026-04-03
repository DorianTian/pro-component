<script setup lang="ts">
import { ProTree } from '@pro/tree'
import { ElTag } from 'element-plus'

import type { ProTreeNodeData } from '@pro/tree'

const treeData: ProTreeNodeData[] = [
  {
    id: 1,
    label: '生产环境',
    status: 'success',
    children: [
      { id: 11, label: 'API 网关', status: 'success' },
      { id: 12, label: '用户服务', status: 'warning' },
      { id: 13, label: '订单服务', status: 'success' },
    ],
  },
  {
    id: 2,
    label: '测试环境',
    status: 'info',
    children: [
      { id: 21, label: 'API 网关', status: 'success' },
      { id: 22, label: '用户服务', status: 'danger' },
    ],
  },
]
</script>

<template>
  <div style="width: 360px">
    <ProTree :data="treeData" default-expand-all :searchable="false">
      <template #default="{ data }">
        <span style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1">
            {{ data.label }}
          </span>
          <ElTag
            v-if="data.status"
            :type="
              data.status === 'success'
                ? 'success'
                : data.status === 'warning'
                  ? 'warning'
                  : data.status === 'danger'
                    ? 'danger'
                    : 'info'
            "
            size="small"
            effect="light"
          >
            {{
              data.status === 'success'
                ? '正常'
                : data.status === 'warning'
                  ? '告警'
                  : data.status === 'danger'
                    ? '故障'
                    : '待部署'
            }}
          </ElTag>
        </span>
      </template>
    </ProTree>
  </div>
</template>
