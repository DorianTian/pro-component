import { defineComponent, h } from 'vue'
import { ElCheckbox, ElCheckboxGroup, ElCheckboxButton } from 'element-plus'

export const Checkbox = defineComponent({
  name: 'Checkbox',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElCheckbox, attrs, slots)
  },
})

export const CheckboxGroup = defineComponent({
  name: 'CheckboxGroup',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElCheckboxGroup, attrs, slots)
  },
})

export const CheckboxButton = defineComponent({
  name: 'CheckboxButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElCheckboxButton, attrs, slots)
  },
})
