<template>
  <el-dialog
    v-model="visible"
    title="Create Grayscale Strategy"
    width="700px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
      <el-form-item label="App" prop="app_id">
        <el-select
          v-model="formData.app_id"
          placeholder="Select app"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="app in appStore.apps"
            :key="app.app_id"
            :label="`${app.name} (${app.app_id})`"
            :value="app.app_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Package" prop="package_id">
        <el-select
          v-model="formData.package_id"
          placeholder="Select package"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="pkg in appStore.packages"
            :key="pkg.id"
            :label="pkg.name"
            :value="pkg.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Target Version" prop="target_version">
        <el-select
          v-model="formData.target_version"
          placeholder="Select target version"
          filterable
          style="width: 100%"
          :disabled="!selectedPackage"
        >
          <el-option
            v-for="v in availableVersions"
            :key="v.version"
            :label="v.version"
            :value="v.version"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Strategy Type" prop="strategy">
        <el-radio-group v-model="formData.strategy" @change="handleStrategyChange">
          <el-radio value="user_list">User List</el-radio>
          <el-radio value="department">Department</el-radio>
          <el-radio value="percentage">Percentage</el-radio>
          <el-radio value="composite">Composite</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Rule Configuration">
        <GrayscaleRuleBuilder v-model="ruleConfig" :depth="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit"> Create </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { createGrayscaleRule } from '@/api/grayscale'
import { getPackageVersions } from '@/api/versions'
import GrayscaleRuleBuilder from './GrayscaleRuleBuilder.vue'

import type { FormInstance, FormRules } from 'element-plus'
import type { Version, GrayscaleStrategy, GrayscaleCondition, CompositeRule } from '@/api/types'

type RuleNode = GrayscaleCondition | CompositeRule

/** Default percentage for new percentage rules */
const DEFAULT_PERCENTAGE = 10

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const appStore = useAppStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const availableVersions = ref<Version[]>([])

const formData = ref({
  app_id: '',
  package_id: null as number | null,
  target_version: '',
  strategy: 'user_list' as GrayscaleStrategy,
})

const ruleConfig = ref<RuleNode>({
  type: 'user_list',
  values: [],
})

const formRules: FormRules = {
  app_id: [{ required: true, message: 'App is required', trigger: 'change' }],
  package_id: [{ required: true, message: 'Package is required', trigger: 'change' }],
  target_version: [{ required: true, message: 'Target version is required', trigger: 'change' }],
  strategy: [{ required: true, message: 'Strategy is required', trigger: 'change' }],
}

const selectedPackage = computed(() =>
  appStore.packages.find((p) => p.id === formData.value.package_id),
)

watch(
  () => formData.value.package_id,
  async (pkgId) => {
    formData.value.target_version = ''
    if (!pkgId) {
      availableVersions.value = []
      return
    }
    const pkg = appStore.packages.find((p) => p.id === pkgId)
    if (!pkg) return
    try {
      availableVersions.value = await getPackageVersions(pkg.name)
    } catch {
      availableVersions.value = []
    }
  },
)

function handleStrategyChange(strategy: GrayscaleStrategy) {
  if (strategy === 'composite') {
    ruleConfig.value = {
      operator: 'OR',
      conditions: [{ type: 'user_list', values: [] }],
    }
  } else if (strategy === 'percentage') {
    ruleConfig.value = { type: 'percentage', value: DEFAULT_PERCENTAGE, hash_key: 'user_id' }
  } else {
    ruleConfig.value = { type: strategy, values: [] }
  }
}

function resetForm() {
  formData.value = {
    app_id: '',
    package_id: null,
    target_version: '',
    strategy: 'user_list',
  }
  ruleConfig.value = { type: 'user_list', values: [] }
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || formData.value.package_id === null) return

  submitting.value = true
  try {
    await createGrayscaleRule({
      app_id: formData.value.app_id,
      package_id: formData.value.package_id,
      target_version: formData.value.target_version,
      strategy: formData.value.strategy,
      rule_config: ruleConfig.value,
    })
    ElMessage.success('Grayscale strategy created')
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>
