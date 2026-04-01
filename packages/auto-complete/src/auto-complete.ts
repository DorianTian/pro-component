import { defineComponent, h } from 'vue'
import { ElAutocomplete } from 'element-plus'

export const AutoComplete = defineComponent({
  name: 'AutoComplete',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElAutocomplete, attrs, slots)
  },
})
