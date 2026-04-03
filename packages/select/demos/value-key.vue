<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@pro/select'
import { ElOption } from 'element-plus'

interface Employee {
  id: number
  name: string
  department: string
}

const value = ref<Employee>()

const employees: Employee[] = [
  { id: 1, name: '张伟', department: '研发部' },
  { id: 2, name: '李娜', department: '产品部' },
  { id: 3, name: '王强', department: '设计部' },
  { id: 4, name: '赵敏', department: '市场部' },
]
</script>

<template>
  <div style="max-width: 380px">
    <label
      style="display: block; margin-bottom: 8px; font-size: 13px; color: #737373; font-weight: 500"
      >对象作为值（value-key）</label
    >
    <Select v-model="value" value-key="id" placeholder="请选择员工">
      <ElOption
        v-for="emp in employees"
        :key="emp.id"
        :label="`${emp.name} - ${emp.department}`"
        :value="emp"
      />
    </Select>
    <p v-if="value" style="margin-top: 8px; font-size: 13px; color: #525252">
      已选：{{ value.name }}（{{ value.department }}）
    </p>
  </div>
</template>
