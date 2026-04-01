import { defineComponent, h } from 'vue'
import { ElRadio, ElRadioGroup, ElRadioButton } from 'element-plus'

export const Radio = defineComponent({
  name: 'Radio',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElRadio, attrs, slots)
  },
})

export const RadioGroup = defineComponent({
  name: 'RadioGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElRadioGroup, attrs, slots)
  },
})

export const RadioButton = defineComponent({
  name: 'RadioButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElRadioButton, attrs, slots)
  },
})
