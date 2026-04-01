import { defineComponent, h } from 'vue'
import { ElTabPane } from 'element-plus'

export const ProTabPane = defineComponent({
  name: 'ProTabPane',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElTabPane, attrs, slots)
  },
})
