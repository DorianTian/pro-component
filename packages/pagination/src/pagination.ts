import { defineComponent, h, mergeProps } from 'vue'
import { ElPagination } from 'element-plus'

export const Pagination = defineComponent({
  name: 'Pagination',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ElPagination,
        mergeProps(
          {
            layout: 'total, sizes, prev, pager, next, jumper',
            pageSizes: [10, 20, 50, 100],
          },
          attrs,
        ),
        slots,
      )
  },
})
