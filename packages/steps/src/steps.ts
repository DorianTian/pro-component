import { defineComponent, h } from 'vue'
import { ElSteps, ElStep } from 'element-plus'

export const Steps = defineComponent({
  name: 'Steps',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElSteps, attrs, slots)
  },
})

export const Step = defineComponent({
  name: 'Step',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElStep, attrs, slots)
  },
})
