import type { ProTreeNodeData } from './types'

/** Deep clone a tree data array */
export function cloneTree(nodes: ProTreeNodeData[]): ProTreeNodeData[] {
  return nodes.map((node) => {
    const cloned = { ...node }
    if (cloned.children) {
      cloned.children = cloneTree(cloned.children)
    }
    return cloned
  })
}

/** Find a node by key in a tree. Returns the node or null. */
export function findNode(
  nodes: ProTreeNodeData[],
  key: string,
  keyField: string,
): ProTreeNodeData | null {
  const stack = [...nodes]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (String(node[keyField]) === key) return node
    if (node.children) stack.push(...node.children)
  }
  return null
}

/** Find the parent of a node by key. Returns { parent, index } or null if root-level. */
export function findParent(
  nodes: ProTreeNodeData[],
  key: string,
  keyField: string,
): { parent: ProTreeNodeData | null; index: number } | null {
  // Check root level
  const rootIdx = nodes.findIndex((n) => String(n[keyField]) === key)
  if (rootIdx !== -1) return { parent: null, index: rootIdx }

  const stack: ProTreeNodeData[] = [...nodes]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (!node.children) continue
    const idx = node.children.findIndex((c) => String(c[keyField]) === key)
    if (idx !== -1) return { parent: node, index: idx }
    stack.push(...node.children)
  }
  return null
}

/** Remove a node from the tree by key. Mutates the array in place. Returns the removed node or null. */
export function removeNode(
  nodes: ProTreeNodeData[],
  key: string,
  keyField: string,
): ProTreeNodeData | null {
  const location = findParent(nodes, key, keyField)
  if (!location) return null

  const siblings = location.parent ? location.parent.children! : nodes
  return siblings.splice(location.index, 1)[0] ?? null
}

/**
 * Insert a node into the tree at a specific position. Mutates the array in place.
 * @param position - 'before': insert before target, 'after': insert after target, 'inner': append as child of target
 */
export function insertNode(
  nodes: ProTreeNodeData[],
  targetKey: string,
  node: ProTreeNodeData,
  position: 'before' | 'after' | 'inner',
  keyField: string,
): boolean {
  if (position === 'inner') {
    const target = findNode(nodes, targetKey, keyField)
    if (!target) return false
    if (!target.children) target.children = []
    target.children.push(node)
    return true
  }

  const location = findParent(nodes, targetKey, keyField)
  if (!location) return false

  const siblings = location.parent ? location.parent.children! : nodes
  const insertIdx = position === 'before' ? location.index : location.index + 1
  siblings.splice(insertIdx, 0, node)
  return true
}

/** Calculate the depth of a node in the tree (root = 1) */
export function getNodeDepth(nodes: ProTreeNodeData[], key: string, keyField: string): number {
  function walk(list: ProTreeNodeData[], depth: number): number {
    for (const node of list) {
      if (String(node[keyField]) === key) return depth
      if (node.children) {
        const found = walk(node.children, depth + 1)
        if (found > 0) return found
      }
    }
    return 0
  }
  return walk(nodes, 1)
}

/** Get the max depth of a subtree (the node itself counts as 1) */
export function getSubtreeDepth(node: ProTreeNodeData): number {
  if (!node.children || node.children.length === 0) return 1
  let max = 0
  for (const child of node.children) {
    max = Math.max(max, getSubtreeDepth(child))
  }
  return 1 + max
}
