/* Pro Components Theme — Design Token System
 * Visual system: shadcn New York (Neutral + Blue-600 primary).
 * Import order matters:
 *   base (layer declaration) → primitives → semantic → density
 *   → el variable mapping → global component overrides → pro component overrides
 *   → dark mode (last, overrides light tokens) */
import './base.css'
import './tokens/primitives.css'
import './tokens/semantic.css'
import './tokens/density.css'
import './overrides/element-plus.css'
import './overrides/components.css'
import './overrides/form.css'
import './overrides/table.css'
import './overrides/descriptions.css'
import './overrides/steps.css'
import './overrides/dialog.css'
import './tokens/dark.css'

/** Current themes package version */
export const THEMES_VERSION = '0.2.0'
