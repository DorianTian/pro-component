<script setup lang="ts">
import { ref, computed } from 'vue'
import { Checkbox, CheckboxGroup } from '@pro/checkbox'

const options = ['苹果', '香蕉', '橙子', '葡萄']
const selected = ref(['苹果', '橙子'])

const isAll = computed(() => selected.value.length === options.length)
const isIndeterminate = computed(
  () => selected.value.length > 0 && selected.value.length < options.length,
)

function handleCheckAll(val: boolean) {
  selected.value = val ? [...options] : []
}
</script>

<template>
  <div style="max-width: 480px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >全选 / 半选状态</label
    >
    <Checkbox
      :model-value="isAll"
      :indeterminate="isIndeterminate"
      @update:model-value="handleCheckAll"
    >
      全选
    </Checkbox>
    <div style="margin: 12px 0 0; padding: 12px 0 0; border-top: 1px solid #f0f0f0">
      <CheckboxGroup v-model="selected">
        <Checkbox v-for="item in options" :key="item" :value="item">{{ item }}</Checkbox>
      </CheckboxGroup>
    </div>
  </div>
</template>
