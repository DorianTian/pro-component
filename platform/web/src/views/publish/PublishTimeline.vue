<template>
  <div v-loading="loading">
    <el-empty v-if="!loading && events.length === 0" description="No version events yet" />
    <el-timeline v-else>
      <el-timeline-item
        v-for="event in events"
        :key="event.id"
        :timestamp="formatDate(event.created_at)"
        :type="eventType(event.action)"
        :hollow="event.action === 'rollback'"
        placement="top"
      >
        <el-card shadow="hover" class="timeline-card">
          <div class="timeline-header">
            <StatusBadge :status="event.action" />
            <span class="operator">by {{ event.operator }}</span>
          </div>
          <div class="timeline-body">
            <span v-if="event.from_version" class="version-change">
              {{ event.from_version }} <el-icon><Right /></el-icon> {{ event.to_version }}
            </span>
            <span v-else-if="event.to_version" class="version-change">
              {{ event.to_version }}
            </span>
            <el-text v-if="event.reason" type="info" size="small" class="event-reason">
              Reason: {{ event.reason }}
            </el-text>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <div v-if="total > TIMELINE_PAGE_SIZE" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        :page-size="TIMELINE_PAGE_SIZE"
        :total="total"
        layout="prev, pager, next"
        @change="loadEvents"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Right } from '@element-plus/icons-vue'
import { getVersionEvents } from '@/api/versions'
import StatusBadge from '@/components/StatusBadge.vue'

import type { VersionEvent, EventAction } from '@/api/types'

/** Page size for timeline event list */
const TIMELINE_PAGE_SIZE = 20

const events = ref<VersionEvent[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

type TimelineType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

const EVENT_TYPE_MAP: Partial<Record<EventAction, TimelineType>> = {
  publish: 'success',
  pin: 'primary',
  upgrade: 'primary',
  rollback: 'danger',
  deprecate: 'warning',
  grayscale_start: 'info',
  grayscale_complete: 'success',
}

function eventType(action: EventAction): TimelineType {
  return EVENT_TYPE_MAP[action] ?? 'info'
}

async function loadEvents() {
  loading.value = true
  try {
    const result = await getVersionEvents({
      page: page.value,
      pageSize: TIMELINE_PAGE_SIZE,
    })
    events.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadEvents)
</script>

<style scoped>
.timeline-card {
  max-width: 500px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #909399;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.event-reason {
  margin-top: 4px;
  font-style: italic;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
