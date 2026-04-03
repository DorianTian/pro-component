<script setup lang="ts">
import { ref } from 'vue'
import { DiffEditor } from '@pro/code-editor'

const original = `function calculateTotal(items) {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity
  }
  return total
}

const items = [
  { name: 'Widget', price: 9.99, quantity: 3 },
  { name: 'Gadget', price: 24.99, quantity: 1 },
]

console.log('Total:', calculateTotal(items))`

const modified = ref(`interface CartItem {
  name: string
  price: number
  quantity: number
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )
}

const items: CartItem[] = [
  { name: 'Widget', price: 9.99, quantity: 3 },
  { name: 'Gadget', price: 24.99, quantity: 1 },
]

console.log('Total:', calculateTotal(items).toFixed(2))`)

const sideBySide = ref(true)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <label style="font-size: 13px; cursor: pointer; user-select: none">
        <input v-model="sideBySide" type="checkbox" style="margin-right: 6px" />
        Side by side
      </label>
    </div>
    <DiffEditor
      :original="original"
      :modified="modified"
      language="typescript"
      :side-by-side="sideBySide"
      :min-height="400"
    />
  </div>
</template>
