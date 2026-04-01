import { defineComponent, h } from 'vue'
import { ElSlider } from 'element-plus'

export const Slider = defineComponent({
  name: 'Slider',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElSlider, attrs, slots)
  },
})
