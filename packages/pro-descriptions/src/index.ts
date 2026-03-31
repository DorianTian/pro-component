// Component — Vue SFC default export re-exported as named
import ProDescriptions from './ProDescriptions.vue'

export { ProDescriptions }

// Composable
export { useProDescriptions } from './composables/use-pro-descriptions'

// Types (separate group, always last)
export type {
  DescriptionItem,
  UseProDescriptionsOptions,
  UseProDescriptionsReturn,
} from './composables/use-pro-descriptions'
