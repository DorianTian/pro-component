import { defineComponent, h } from 'vue'
import { ElColorPicker } from 'element-plus'

export const ColorPicker = defineComponent({
  name: 'ColorPicker',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElColorPicker, attrs, slots)
  },
})
