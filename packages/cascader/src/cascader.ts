import { defineComponent, h, mergeProps } from 'vue'
import { ElCascader } from 'element-plus'

export const Cascader = defineComponent({
  name: 'Cascader',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElCascader,
        mergeProps(
          {
            clearable: true,
            filterable: true,
          },
          attrs,
        ),
        slots,
      )
  },
})
