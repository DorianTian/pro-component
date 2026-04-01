import { defineComponent, h, mergeProps } from 'vue'
import { ElTooltip } from 'element-plus'

export const Tooltip = defineComponent({
  name: 'Tooltip',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElTooltip,
        mergeProps(
          {
            showAfter: 300,
          },
          attrs,
        ),
        slots,
      )
  },
})
