<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@pro/pagination'

const currentPage = ref(1)
const pageSize = ref(20)

const compactPage = ref(1)

const customPage = ref(1)
const customSize = ref(10)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 32px; max-width: 720px">
    <!-- Default: full-featured -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        Default (full layout)
      </h4>
      <Pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="500" />
      <p style="margin: 8px 0 0; font-size: 13px; color: #a3a3a3">
        Page {{ currentPage }}, {{ pageSize }}/page
      </p>
    </section>

    <!-- Compact mode -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        Compact (prev / pager / next only)
      </h4>
      <Pagination v-model:current-page="compactPage" :page-size="20" :total="200" compact />
    </section>

    <!-- Auto-hide: invisible when total <= pageSize -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        Auto-hide (total=8, pageSize=20 → hidden)
      </h4>
      <Pagination :current-page="1" :page-size="20" :total="8" auto-hide />
      <p style="font-size: 13px; color: #a3a3a3">← nothing here, as expected</p>
    </section>

    <!-- Custom total formatter -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        Custom total formatter
      </h4>
      <Pagination
        v-model:current-page="customPage"
        v-model:page-size="customSize"
        :total="256"
        :total-formatter="(total, [start, end]) => `Showing ${start}-${end} of ${total} records`"
      />
    </section>

    <!-- Selective layout controls -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        No jumper, no size changer
      </h4>
      <Pagination
        :current-page="1"
        :page-size="20"
        :total="300"
        :show-quick-jumper="false"
        :show-size-changer="false"
      />
    </section>

    <!-- Background variant -->
    <section>
      <h4 style="margin: 0 0 12px; font-size: 14px; color: #525252; font-weight: 600">
        With background
      </h4>
      <Pagination :current-page="1" :page-size="20" :total="500" background />
    </section>
  </div>
</template>
