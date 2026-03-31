/* Pro Components Theme — Design Token System
 * Import order matters: base (layer declaration) → primitives → semantic → density → el-overrides → dark */
import './base.css'
import './tokens/primitives.css'
import './tokens/semantic.css'
import './tokens/density.css'
import './overrides/element-plus.css'
import './tokens/dark.css'

/** Current themes package version */
export const THEMES_VERSION = '0.1.0'
