import { defineComponent, h } from 'vue'
import { ElStatistic } from 'element-plus'

export const Statistic = defineComponent({
  name: 'Statistic',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElStatistic, attrs, slots)
  },
})
