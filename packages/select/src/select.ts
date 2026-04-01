import { defineComponent, h, mergeProps } from 'vue'
import { ElSelect } from 'element-plus'

export const Select = defineComponent({
  name: 'Select',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElSelect,
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
