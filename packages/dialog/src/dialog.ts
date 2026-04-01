import { defineComponent, h, mergeProps } from 'vue'
import { ElDialog } from 'element-plus'

export const Dialog = defineComponent({
  name: 'Dialog',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElDialog,
        mergeProps(
          {
            appendToBody: true,
            draggable: true,
          },
          attrs,
        ),
        slots,
      )
  },
})
