import { defineComponent, h, mergeProps } from 'vue'
import { ElDatePicker } from 'element-plus'

export const DatePicker = defineComponent({
  name: 'DatePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElDatePicker,
        mergeProps(
          {
            clearable: true,
            valueFormat: 'YYYY-MM-DD',
          },
          attrs,
        ),
        slots,
      )
  },
})
