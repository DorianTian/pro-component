import { defineComponent, h } from 'vue'
import { ElUpload } from 'element-plus'

export const Upload = defineComponent({
  name: 'Upload',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElUpload, attrs, slots)
  },
})
