<template>
  <el-dialog
    v-model="visible"
    title="Rollback Version"
    width="600px"
    :close-on-click-modal="false"
    @close="resetState"
  >
    <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 24px">
      <el-step title="Configure" />
      <el-step title="Pre-check" />
      <el-step title="Confirm" />
    </el-steps>

    <!-- Step 0: Configure -->
    <div v-show="currentStep === 0">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="Current Version">
          <el-tag>{{ currentVersion }}</el-tag>
        </el-form-item>
        <el-form-item label="Target Version" prop="target_version">
          <el-select
            v-model="formData.target_version"
            placeholder="Select rollback target"
            filterable
            style="width: 100%"
          >
            <el-option v-for="v in rollbackTargets" :key="v" :label="v" :value="v" />
          </el-select>
        </el-form-item>
        <el-form-item label="Reason" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="Mandatory: explain why this rollback is needed"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 1: Pre-check -->
    <div v-show="currentStep === 1">
      <div v-loading="preCheckLoading" class="precheck-results">
        <template v-if="preCheckResult">
          <el-result
            :icon="preCheckPassed ? 'success' : 'warning'"
            :title="preCheckPassed ? 'Pre-check passed' : 'Pre-check has warnings'"
          />

          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="CDN Resources Exist">
              <el-tag
                :type="preCheckResult.cdn_resources_exist ? 'success' : 'danger'"
                size="small"
              >
                {{ preCheckResult.cdn_resources_exist ? 'Yes' : 'No' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="SRI Hash Valid">
              <el-tag :type="preCheckResult.sri_hash_valid ? 'success' : 'danger'" size="small">
                {{ preCheckResult.sri_hash_valid ? 'Yes' : 'No' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Target Version">
              {{ preCheckResult.target_version }}
            </el-descriptions-item>
            <el-descriptions-item label="Affected Apps">
              <el-tag
                v-for="app in preCheckResult.affected_apps"
                :key="app"
                size="small"
                style="margin-right: 4px"
              >
                {{ app }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <el-alert
            v-for="(warning, i) in preCheckResult.warnings"
            :key="i"
            :title="warning"
            type="warning"
            :closable="false"
            style="margin-top: 8px"
          />
        </template>
      </div>
    </div>

    <!-- Step 2: Confirm -->
    <div v-show="currentStep === 2">
      <div class="confirm-summary">
        <el-alert type="error" :closable="false" show-icon>
          <template #title>
            <strong
              >You are about to roll back from {{ currentVersion }} to
              {{ formData.target_version }}</strong
            >
          </template>
          This action will update version mappings for all affected apps. The rollback will go
          through grayscale (internal traffic first).
        </el-alert>

        <el-descriptions :column="1" border size="small" style="margin-top: 16px">
          <el-descriptions-item label="From">
            {{ currentVersion }}
          </el-descriptions-item>
          <el-descriptions-item label="To">
            {{ formData.target_version }}
          </el-descriptions-item>
          <el-descriptions-item label="Reason">
            {{ formData.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="Affected Apps">
            {{ preCheckResult?.affected_apps.join(', ') || '--' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-checkbox v-model="finalConfirmation" style="margin-top: 16px">
          I understand the impact and want to proceed with this rollback
        </el-checkbox>
      </div>
    </div>

    <template #footer>
      <el-button v-if="currentStep > 0" @click="currentStep--"> Back </el-button>
      <el-button @click="visible = false"> Cancel </el-button>
      <el-button v-if="currentStep === 0" type="primary" @click="handleNextToPreCheck">
        Run Pre-check
      </el-button>
      <el-button
        v-else-if="currentStep === 1"
        type="primary"
        :disabled="!preCheckPassed"
        @click="currentStep = 2"
      >
        Next
      </el-button>
      <el-button
        v-else
        type="danger"
        :loading="executing"
        :disabled="!finalConfirmation"
        @click="handleExecute"
      >
        Execute Rollback
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { rollbackPreCheck, executeRollback } from '@/api/operations'

import type { FormInstance, FormRules } from 'element-plus'
import type { RollbackPreCheck } from '@/api/types'

/** Minimum length for rollback reason field */
const MIN_REASON_LENGTH = 10

const props = defineProps<{
  versionId: number
  currentVersion: string
  rollbackTargets: string[]
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  rolledBack: []
}>()

const formRef = ref<FormInstance>()
const currentStep = ref(0)
const preCheckLoading = ref(false)
const preCheckResult = ref<RollbackPreCheck | null>(null)
const executing = ref(false)
const finalConfirmation = ref(false)

const formData = ref({
  target_version: '',
  reason: '',
})

const formRules: FormRules = {
  target_version: [{ required: true, message: 'Target version is required', trigger: 'change' }],
  reason: [
    { required: true, message: 'Reason is mandatory for rollback', trigger: 'blur' },
    {
      min: MIN_REASON_LENGTH,
      message: `Reason must be at least ${String(MIN_REASON_LENGTH)} characters`,
      trigger: 'blur',
    },
  ],
}

const preCheckPassed = computed(() => {
  if (!preCheckResult.value) return false
  return preCheckResult.value.cdn_resources_exist && preCheckResult.value.sri_hash_valid
})

async function handleNextToPreCheck() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  currentStep.value = 1
  preCheckLoading.value = true
  preCheckResult.value = null

  try {
    preCheckResult.value = await rollbackPreCheck(props.versionId, formData.value.target_version)
  } catch {
    // API failure -- show error and reset to first step for retry
    ElMessage.error('Pre-check failed')
    currentStep.value = 0
  } finally {
    preCheckLoading.value = false
  }
}

async function handleExecute() {
  if (!finalConfirmation.value) return

  executing.value = true
  try {
    await executeRollback(props.versionId, {
      target_version: formData.value.target_version,
      reason: formData.value.reason,
    })
    ElMessage.success('Rollback initiated -- going through grayscale')
    visible.value = false
    emit('rolledBack')
  } finally {
    executing.value = false
  }
}

function resetState() {
  currentStep.value = 0
  preCheckResult.value = null
  finalConfirmation.value = false
  formData.value = { target_version: '', reason: '' }
  formRef.value?.resetFields()
}
</script>

<style scoped>
.precheck-results {
  min-height: 200px;
}

.confirm-summary {
  padding: 8px 0;
}
</style>
