import { defineComponent, h } from 'vue'
import { ElPopconfirm } from 'element-plus'

export const Popconfirm = defineComponent({
  name: 'Popconfirm',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElPopconfirm, attrs, slots)
  },
})
