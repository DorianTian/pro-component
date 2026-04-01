import { defineComponent, h } from 'vue'
import { ElDivider } from 'element-plus'

export const Divider = defineComponent({
  name: 'Divider',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElDivider, attrs, slots)
  },
})
