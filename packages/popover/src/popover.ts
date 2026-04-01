import { defineComponent, h } from 'vue'
import { ElPopover } from 'element-plus'

export const Popover = defineComponent({
  name: 'Popover',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElPopover, attrs, slots)
  },
})
