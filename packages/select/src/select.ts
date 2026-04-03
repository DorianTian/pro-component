import { defineComponent, h, mergeProps, type PropType } from 'vue'
import { ElSelect, ElSelectV2 } from 'element-plus'

export interface SelectOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

export const Select = defineComponent({
  name: 'Select',
  inheritAttrs: false,
  props: {
    /** Enable virtual scrolling via ElSelectV2 for large option lists (500+) */
    virtual: { type: Boolean, default: false },
    /** Flat options array — required when virtual is true */
    options: { type: Array as PropType<SelectOption[]>, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      if (props.virtual) {
        const merged = {
          clearable: true,
          filterable: true,
          options: props.options ?? [],
          ...attrs,
        }
        // ElSelectV2 has strict props typing — use functional render with type assertion
        return h(ElSelectV2 as never, merged, slots)
      }

      return h(
        ElSelect,
        mergeProps(
          {
            clearable: true,
            filterable: true,
          },
          attrs,
        ),
        slots,
      )
    }
  },
})
