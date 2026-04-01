import { defineComponent, h, mergeProps } from 'vue'
import { ElDrawer } from 'element-plus'

export const Drawer = defineComponent({
  name: 'Drawer',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElDrawer,
        mergeProps(
          {
            appendToBody: true,
          },
          attrs,
        ),
        slots,
      )
  },
})
