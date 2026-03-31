<script setup lang="ts">
interface PropDef {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

interface EventDef {
  name: string
  type: string
  description: string
}

interface SlotDef {
  name: string
  type: string
  description: string
}

interface ApiData {
  props: PropDef[]
  events: EventDef[]
  slots: SlotDef[]
}

const props = defineProps<{
  /** Path to the generated api.json file, relative to docs root */
  src: string
}>()

const apiData = defineModel<ApiData>()

// Load api data from JSON — cast through unknown to satisfy strict type checking
// since import.meta.glob's return type cannot be resolved by the linter
const modules = import.meta.glob('/api-data/**/*.json', { eager: true }) as unknown as Record<
  string,
  ApiData
>
const key = Object.keys(modules).find((k) => k.includes(props.src))
if (key) {
  apiData.value = modules[key]
}
</script>

<template>
  <div v-if="apiData" class="api-doc">
    <!-- Props Table -->
    <div v-if="apiData.props?.length" class="api-section">
      <h3 id="props">
        Props
        <a class="header-anchor" href="#props" aria-label="Permalink to Props" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>属性名</th>
            <th>说明</th>
            <th>类型</th>
            <th>默认值</th>
            <th>必填</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in apiData.props" :key="prop.name">
            <td class="prop-name">{{ prop.name }}</td>
            <td>{{ prop.description }}</td>
            <td class="prop-type">{{ prop.type }}</td>
            <td class="prop-default">{{ prop.default || '—' }}</td>
            <td>{{ prop.required ? '是' : '否' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Events Table -->
    <div v-if="apiData.events?.length" class="api-section">
      <h3 id="events">
        Events
        <a class="header-anchor" href="#events" aria-label="Permalink to Events" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>事件名</th>
            <th>说明</th>
            <th>类型</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in apiData.events" :key="event.name">
            <td class="prop-name">{{ event.name }}</td>
            <td>{{ event.description }}</td>
            <td class="prop-type">{{ event.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Slots Table -->
    <div v-if="apiData.slots?.length" class="api-section">
      <h3 id="slots">
        Slots
        <a class="header-anchor" href="#slots" aria-label="Permalink to Slots" />
      </h3>
      <table class="api-table">
        <thead>
          <tr>
            <th>插槽名</th>
            <th>说明</th>
            <th>作用域参数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in apiData.slots" :key="slot.name">
            <td class="prop-name">{{ slot.name }}</td>
            <td>{{ slot.description }}</td>
            <td class="prop-type">{{ slot.type || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="api-doc-empty">
    <p>
      API data not found for <code>{{ src }}</code
      >. Run <code>pnpm gen:api</code> to generate.
    </p>
  </div>
</template>

<style scoped>
.api-section {
  margin: 24px 0;
}

.api-doc-empty {
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  color: var(--vp-c-text-2);
}
</style>
