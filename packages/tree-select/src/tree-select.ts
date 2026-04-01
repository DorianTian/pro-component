import { defineComponent, h, mergeProps } from 'vue'
import { ElTreeSelect } from 'element-plus'

export const TreeSelect = defineComponent({
  name: 'TreeSelect',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElTreeSelect,
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
