import { defineComponent, h, mergeProps } from 'vue'
import { ElInputNumber } from 'element-plus'

export const InputNumber = defineComponent({
  name: 'InputNumber',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElInputNumber,
        mergeProps(
          {
            controlsPosition: 'right',
          },
          attrs,
        ),
        slots,
      )
  },
})
