import { defineComponent, h } from 'vue'
import { ElRate } from 'element-plus'

export const Rate = defineComponent({
  name: 'Rate',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElRate, attrs, slots)
  },
})
