import { defineComponent, h, mergeProps } from 'vue'
import { ElInput } from 'element-plus'

export const Input = defineComponent({
  name: 'Input',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElInput,
        mergeProps(
          {
            clearable: true,
          },
          attrs,
        ),
        slots,
      )
  },
})
