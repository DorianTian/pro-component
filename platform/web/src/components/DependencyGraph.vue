<template>
  <div class="dep-graph-container">
    <div v-if="loading" class="graph-loading">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>Loading dependency graph...</span>
    </div>
    <div v-else-if="error" class="graph-error">
      <el-result icon="error" :sub-title="error">
        <template #extra>
          <el-button @click="loadGraph">Retry</el-button>
        </template>
      </el-result>
    </div>
    <svg v-else :width="svgWidth" :height="svgHeight" class="dep-graph-svg">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#909399" />
        </marker>
      </defs>

      <g :transform="`translate(${GRAPH_MARGIN}, ${GRAPH_MARGIN})`">
        <line
          v-for="(edge, i) in layoutEdges"
          :key="`edge-${i}`"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          stroke="#c0c4cc"
          stroke-width="1.5"
          marker-end="url(#arrowhead)"
        />

        <g
          v-for="node in layoutNodes"
          :key="node.id"
          :transform="`translate(${node.x - NODE_WIDTH / 2}, ${node.y - NODE_HEIGHT / 2})`"
          class="graph-node"
        >
          <rect
            :width="NODE_WIDTH"
            :height="NODE_HEIGHT"
            rx="6"
            :fill="node.type === 'app' ? '#ecf5ff' : '#f0f9eb'"
            :stroke="node.type === 'app' ? '#409eff' : '#67c23a'"
            stroke-width="1.5"
          />
          <text
            :x="NODE_WIDTH / 2"
            :y="NODE_HEIGHT / 2 - 4"
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            fill="#303133"
          >
            {{ node.label }}
          </text>
          <text
            :x="NODE_WIDTH / 2"
            :y="NODE_HEIGHT / 2 + 12"
            text-anchor="middle"
            font-size="10"
            fill="#909399"
          >
            {{ node.version }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import dagre from '@dagrejs/dagre'
import { getResolutionGraph } from '@/api/versions'

import type { ResolutionGraph } from '@/api/types'

const props = defineProps<{
  appId: string
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const graphData = ref<ResolutionGraph | null>(null)

/** Node dimensions for dagre layout (px) */
const NODE_WIDTH = 160
const NODE_HEIGHT = 50
/** SVG outer margin (px) */
const GRAPH_MARGIN = 40
/** Dagre rank separation between levels (px) */
const DAGRE_RANK_SEP = 80
/** Dagre node separation within rank (px) */
const DAGRE_NODE_SEP = 40
/** Default SVG dimensions when no nodes exist */
const DEFAULT_SVG_WIDTH = 600
const DEFAULT_SVG_HEIGHT = 400

interface LayoutNode {
  id: string
  label: string
  version: string
  type: 'app' | 'package'
  x: number
  y: number
}

interface LayoutEdge {
  x1: number
  y1: number
  x2: number
  y2: number
}

const layoutNodes = ref<LayoutNode[]>([])
const layoutEdges = ref<LayoutEdge[]>([])

const svgWidth = computed(() => {
  if (layoutNodes.value.length === 0) return DEFAULT_SVG_WIDTH
  const maxX = Math.max(...layoutNodes.value.map((n) => n.x))
  return maxX + NODE_WIDTH / 2 + GRAPH_MARGIN * 2
})

const svgHeight = computed(() => {
  if (layoutNodes.value.length === 0) return DEFAULT_SVG_HEIGHT
  const maxY = Math.max(...layoutNodes.value.map((n) => n.y))
  return maxY + NODE_HEIGHT / 2 + GRAPH_MARGIN * 2
})

function computeLayout(data: ResolutionGraph) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: DAGRE_RANK_SEP, nodesep: DAGRE_NODE_SEP })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of data.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of data.edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  layoutNodes.value = data.nodes.map((n) => {
    const pos = g.node(n.id)
    return {
      id: n.id,
      label: n.label,
      version: n.version,
      type: n.type,
      x: pos.x,
      y: pos.y,
    }
  })

  layoutEdges.value = data.edges.map((e) => {
    const sourcePos = g.node(e.source)
    const targetPos = g.node(e.target)
    return {
      x1: sourcePos.x,
      y1: sourcePos.y + NODE_HEIGHT / 2,
      x2: targetPos.x,
      y2: targetPos.y - NODE_HEIGHT / 2,
    }
  })
}

async function loadGraph() {
  loading.value = true
  error.value = null
  try {
    const data = await getResolutionGraph(props.appId)
    graphData.value = data
    computeLayout(data)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load graph'
  } finally {
    loading.value = false
  }
}

onMounted(loadGraph)
</script>

<style scoped>
.dep-graph-container {
  min-height: 400px;
  overflow: auto;
}

.graph-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 400px;
  color: #909399;
}

.graph-error {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dep-graph-svg {
  display: block;
}

.graph-node {
  cursor: default;
}

.graph-node:hover rect {
  filter: brightness(0.95);
}
</style>
