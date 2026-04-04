<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@pro/code-editor'
import { Copy } from 'lucide-vue-next'

const editorRef = ref<InstanceType<typeof CodeEditor> | null>(null)

const sql = ref(`-- 用户活跃度分析查询
WITH daily_active AS (
  SELECT
    DATE(event_time) AS dt,
    user_id,
    COUNT(*) AS event_count
  FROM user_events
  WHERE event_time >= CURRENT_DATE - INTERVAL '30' DAY
  GROUP BY DATE(event_time), user_id
),
user_retention AS (
  SELECT
    d1.user_id,
    d1.dt AS first_day,
    d2.dt AS return_day,
    DATEDIFF(d2.dt, d1.dt) AS days_since
  FROM daily_active d1
  INNER JOIN daily_active d2
    ON d1.user_id = d2.user_id
    AND d2.dt > d1.dt
)
SELECT
  first_day,
  COUNT(DISTINCT user_id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN days_since = 1 THEN user_id END) AS d1_retained,
  COUNT(DISTINCT CASE WHEN days_since = 7 THEN user_id END) AS d7_retained,
  ROUND(
    COUNT(DISTINCT CASE WHEN days_since = 1 THEN user_id END) * 100.0 /
    NULLIF(COUNT(DISTINCT user_id), 0),
    2
  ) AS d1_retention_rate
FROM user_retention
GROUP BY first_day
ORDER BY first_day DESC;`)

function handleFormat() {
  editorRef.value?.formatDocument()
}

function handleCopy() {
  navigator.clipboard.writeText(sql.value)
}
</script>

<template>
  <div>
    <CodeEditor ref="editorRef" v-model="sql" language="sql" :min-height="420" :show-toolbar="true">
      <template #toolbar-actions>
        <button class="pro-code-editor__action" title="Copy" @click="handleCopy">
          <Copy :size="14" />
        </button>
      </template>
    </CodeEditor>
  </div>
</template>
