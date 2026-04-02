<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@pro/tree-select'

const value = ref('')

const data = [
  {
    label: 'Engineering',
    value: 'eng',
    children: [
      {
        label: 'Frontend',
        value: 'fe',
        children: [
          { label: 'Team Alpha', value: 'alpha' },
          { label: 'Team Beta', value: 'beta' },
        ],
      },
      {
        label: 'Backend',
        value: 'be',
        children: [
          { label: 'API Team', value: 'api' },
          { label: 'Data Team', value: 'data' },
        ],
      },
    ],
  },
  {
    label: 'Design',
    value: 'design',
    children: [
      { label: 'UX', value: 'ux' },
      { label: 'Visual', value: 'visual' },
    ],
  },
]
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 600px">
    <div>
      <label
        style="
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #737373;
          font-weight: 500;
        "
        >Basic tree select</label
      >
      <TreeSelect v-model="value" :data="data" placeholder="Select a team" />
    </div>
  </div>
</template>
