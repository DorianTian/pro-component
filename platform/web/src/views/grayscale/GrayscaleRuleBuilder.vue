<template>
  <div class="rule-builder" :class="{ nested: depth > 0 }">
    <div v-if="isComposite" class="composite-rule">
      <div class="composite-header">
        <el-radio-group
          :model-value="compositeOperator"
          size="small"
          @update:model-value="(v: string | number | boolean | undefined) => { if (v !== undefined) updateOperator(v) }"
        >
          <el-radio-button value="AND">AND</el-radio-button>
          <el-radio-button value="OR">OR</el-radio-button>
        </el-radio-group>
        <el-button v-if="depth > 0" size="small" type="danger" text @click="emit('remove')">
          Remove Group
        </el-button>
      </div>

      <div class="conditions-list">
        <div v-for="(condition, index) in compositeConditions" :key="index" class="condition-item">
          <GrayscaleRuleBuilder
            :model-value="condition"
            :depth="depth + 1"
            @update:model-value="updateCondition(index, $event)"
            @remove="removeCondition(index)"
          />
        </div>
      </div>

      <div class="add-buttons">
        <el-button size="small" @click="addSimpleCondition"> + Add Condition </el-button>
        <el-button size="small" @click="addCompositeGroup"> + Add Group </el-button>
      </div>
    </div>

    <div v-else class="simple-rule">
      <el-form inline size="small">
        <el-form-item label="Type">
          <el-select
            :model-value="simpleType"
            style="width: 140px"
            @update:model-value="updateSimpleType"
          >
            <el-option label="User List" value="user_list" />
            <el-option label="Department" value="department" />
            <el-option label="Percentage" value="percentage" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="simpleType === 'user_list'" label="Users">
          <el-select
            :model-value="simpleValues"
            multiple
            filterable
            allow-create
            placeholder="Enter user IDs"
            style="width: 280px"
            @update:model-value="updateSimpleValues"
          />
        </el-form-item>

        <el-form-item v-else-if="simpleType === 'department'" label="Departments">
          <el-select
            :model-value="simpleValues"
            multiple
            filterable
            allow-create
            placeholder="Enter department IDs"
            style="width: 280px"
            @update:model-value="updateSimpleValues"
          />
        </el-form-item>

        <el-form-item v-else-if="simpleType === 'percentage'" label="Percentage">
          <el-slider
            :model-value="simplePercentage"
            :min="1"
            :max="100"
            :format-tooltip="(v: number) => `${v}%`"
            style="width: 200px"
            @update:model-value="(v: number | number[]) => updateSimplePercentage(Array.isArray(v) ? v[0] : v)"
          />
          <span style="margin-left: 8px">{{ simplePercentage }}%</span>
        </el-form-item>

        <el-form-item>
          <el-button
            v-if="depth > 0"
            size="small"
            type="danger"
            text
            :icon="Delete"
            @click="emit('remove')"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'

import type { GrayscaleCondition, CompositeRule } from '@/api/types'

type RuleNode = GrayscaleCondition | CompositeRule

/** Default percentage value for new percentage conditions */
const DEFAULT_PERCENTAGE = 10

const props = withDefaults(
  defineProps<{
    modelValue: RuleNode
    depth?: number
  }>(),
  { depth: 0 },
)

const emit = defineEmits<{
  'update:modelValue': [value: RuleNode]
  remove: []
}>()

const isComposite = computed(() => 'operator' in props.modelValue)

const compositeOperator = computed(() =>
  'operator' in props.modelValue ? props.modelValue.operator : 'AND',
)

const compositeConditions = computed(() =>
  'operator' in props.modelValue ? props.modelValue.conditions : [],
)

const simpleType = computed(() =>
  'type' in props.modelValue ? props.modelValue.type : 'user_list',
)

const simpleValues = computed(() =>
  'type' in props.modelValue && props.modelValue.values ? props.modelValue.values : [],
)

const simplePercentage = computed(() =>
  'type' in props.modelValue && props.modelValue.type === 'percentage'
    ? (props.modelValue.value ?? DEFAULT_PERCENTAGE)
    : DEFAULT_PERCENTAGE,
)

function updateOperator(op: string | number | boolean) {
  if (!isComposite.value) return
  emit('update:modelValue', {
    operator: op as 'AND' | 'OR',
    conditions: [...compositeConditions.value],
  })
}

function updateCondition(index: number, value: RuleNode) {
  if (!isComposite.value) return
  const conditions = [...compositeConditions.value]
  conditions[index] = value
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function removeCondition(index: number) {
  if (!isComposite.value) return
  const conditions = compositeConditions.value.filter((_, i) => i !== index)
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function addSimpleCondition() {
  if (!isComposite.value) return
  const conditions: RuleNode[] = [
    ...compositeConditions.value,
    { type: 'user_list' as const, values: [] },
  ]
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function addCompositeGroup() {
  if (!isComposite.value) return
  const conditions: RuleNode[] = [
    ...compositeConditions.value,
    {
      operator: 'AND' as const,
      conditions: [{ type: 'user_list' as const, values: [] }],
    },
  ]
  emit('update:modelValue', {
    operator: compositeOperator.value,
    conditions,
  })
}

function updateSimpleType(type: string | number | boolean) {
  const t = type as 'user_list' | 'department' | 'percentage'
  if (t === 'percentage') {
    emit('update:modelValue', { type: t, value: DEFAULT_PERCENTAGE, hash_key: 'user_id' })
  } else {
    emit('update:modelValue', { type: t, values: [] })
  }
}

function updateSimpleValues(values: string[]) {
  emit('update:modelValue', { type: simpleType.value, values })
}

function updateSimplePercentage(value: number) {
  emit('update:modelValue', {
    type: 'percentage' as const,
    value,
    hash_key: 'user_id',
  })
}
</script>

<style scoped>
.rule-builder.nested {
  margin-left: 20px;
  border-left: 2px solid #409eff;
  padding-left: 16px;
}

.composite-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.simple-rule {
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
