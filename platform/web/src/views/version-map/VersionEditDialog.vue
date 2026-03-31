<template>
  <el-dialog
    v-model="visible"
    title="Edit Version Mapping"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="versionMap" class="edit-content">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 20px">
        <el-descriptions-item label="Package">
          {{ versionMap.package_name }}
        </el-descriptions-item>
        <el-descriptions-item label="Current Resolved">
          {{ versionMap.resolved_version || '--' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px">
        <el-form-item label="Mode">
          <el-radio-group v-model="versionMode">
            <el-radio value="pinned"> Pin Exact Version </el-radio>
            <el-radio value="range"> Semver Range </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="versionMode === 'pinned'" label="Pinned Version" prop="pinned_version">
          <el-select
            v-model="formData.pinned_version"
            placeholder="Select version"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="v in availableVersions"
              :key="v.version"
              :label="v.version"
              :value="v.version"
            >
              <span>{{ v.version }}</span>
              <StatusBadge :status="v.status" style="margin-left: 8px" />
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="versionMode === 'range'" label="Version Range" prop="version_range">
          <el-input v-model="formData.version_range" placeholder="e.g. ^1.2.0 or >=1.0.0 <2.0.0" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false"> Cancel </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit"> Save </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateAppVersions } from '@/api/apps'
import { getPackageVersions } from '@/api/versions'
import StatusBadge from '@/components/StatusBadge.vue'

import type { FormInstance, FormRules } from 'element-plus'
import type { AppVersionMap, Version } from '@/api/types'

const props = defineProps<{
  versionMap: AppVersionMap | null
}>()

const visible = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  saved: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const versionMode = ref<'pinned' | 'range'>('pinned')
const availableVersions = ref<Version[]>([])

const formData = ref({
  pinned_version: '',
  version_range: '',
})

const formRules: FormRules = {
  pinned_version: [{ required: true, message: 'Select a version', trigger: 'change' }],
  version_range: [
    { required: true, message: 'Enter a semver range', trigger: 'blur' },
    {
      pattern: /^[\^~>=<\s0-9.*|-]+$/,
      message: 'Invalid semver range format',
      trigger: 'blur',
    },
  ],
}

watch(
  () => props.versionMap,
  async (map) => {
    if (!map) return

    if (map.pinned_version) {
      versionMode.value = 'pinned'
      formData.value.pinned_version = map.pinned_version
    } else if (map.version_range) {
      versionMode.value = 'range'
      formData.value.version_range = map.version_range
    }

    try {
      availableVersions.value = await getPackageVersions(map.package_name)
    } catch {
      // API failure -- reset to empty so version dropdown shows nothing
      availableVersions.value = []
    }
  },
)

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.versionMap) return

  submitting.value = true
  try {
    const payload = {
      package_id: props.versionMap.package_id,
      pinned_version: versionMode.value === 'pinned' ? formData.value.pinned_version : null,
      version_range: versionMode.value === 'range' ? formData.value.version_range : null,
    }
    await updateAppVersions(props.versionMap.app_id, [payload])
    ElMessage.success('Version mapping updated')
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.edit-content {
  padding: 8px 0;
}
</style>
