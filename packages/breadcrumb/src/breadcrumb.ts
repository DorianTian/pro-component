import { defineComponent, h, mergeProps } from 'vue'
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'

export const Breadcrumb = defineComponent({
  name: 'Breadcrumb',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElBreadcrumb, mergeProps({ separator: '/' }, attrs), slots)
  },
})

export const BreadcrumbItem = defineComponent({
  name: 'BreadcrumbItem',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(ElBreadcrumbItem, attrs, slots)
  },
})
