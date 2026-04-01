import { defineComponent, h, mergeProps } from 'vue'
import { ElTimePicker } from 'element-plus'

export const TimePicker = defineComponent({
  name: 'TimePicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElTimePicker,
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
