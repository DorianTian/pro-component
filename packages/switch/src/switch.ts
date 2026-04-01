import { defineComponent, h } from 'vue'
import { ElSwitch } from 'element-plus'

export const Switch = defineComponent({
  name: 'Switch',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElSwitch, attrs, slots)
  },
})
