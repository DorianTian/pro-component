import { defineComponent, h } from 'vue'
import { ElBadge } from 'element-plus'

export const Badge = defineComponent({
  name: 'Badge',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElBadge, attrs, slots)
  },
})
