# Pro Components — UI Design Language Spec

> Design language for Vue 3 + Element Plus higher-level component library.
> Not a fork of Element Plus styles — an opinionated upgrade with its own visual identity.

## 1. Design Philosophy

### Identity: "Soft Lavender"

Inspired by Notion/Figma aesthetics — warm, soft, friendly but professional. A cool-warm blend with lavender purple as the signature accent. The design feels like an upgrade the moment you import it.

### Core Principles

| Principle                  | Description                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Warm Precision**         | Soft colors and rounded shapes, but never sloppy. Every pixel intentional.                                  |
| **Layered Depth**          | Container → control → data — each layer has distinct radius, shadow, and spacing.                           |
| **Density-Aware**          | Information-dense UIs (tables, forms) must breathe. Global density system adapts all components together.   |
| **Progressive Disclosure** | Show essentials first. Details on hover, expand, or drill-down. QueryFilter collapse, ColumnSetting panel.  |
| **Motion with Purpose**    | Transitions communicate state changes. No decorative animation. No animation on data-heavy rendering paths. |

### Relationship with Element Plus

**Strategy: Override + Upgrade.** Pro Components replace Element Plus's global CSS variable palette with the Soft Lavender system. When a user imports `@pro/themes`, the entire application — including raw Element Plus components — gets the visual upgrade. Pro-specific tokens (surface layers, semantic colors, density scales) extend beyond what Element Plus provides.

---

## 2. Color System

### 2.1 Palette

All colors defined as CSS custom properties on `:root`. Override Element Plus `--el-color-*` variables for seamless integration.

#### Primary (Lavender)

| Token                             | Value     | Usage                                       |
| --------------------------------- | --------- | ------------------------------------------- |
| `--pro-color-primary`             | `#7c6ce7` | Buttons, links, active states, focus rings  |
| `--pro-color-primary-hover`       | `#6b5bd6` | Hover state for primary elements            |
| `--pro-color-primary-active`      | `#5a4bc5` | Active/pressed state                        |
| `--pro-color-primary-light`       | `#f0edfb` | Active nav item bg, selected row bg, tag bg |
| `--pro-color-primary-ultra-light` | `#f8f7fd` | Subtle hover backgrounds                    |

#### Semantic Colors

| Token                 | Value     | Light Variant | Usage                                |
| --------------------- | --------- | ------------- | ------------------------------------ |
| `--pro-color-success` | `#45b080` | `#e8f5ee`     | Active status, positive metrics      |
| `--pro-color-warning` | `#e5a336` | `#fdf4e4`     | Pending, away, caution states        |
| `--pro-color-danger`  | `#e05555` | `#fce8e8`     | Error, inactive, destructive actions |
| `--pro-color-info`    | `#6e6e80` | `#f0f0f5`     | Neutral status, disabled-like states |

Each semantic color has a 10-step scale (50–900) generated from the base value, plus a `-light` variant for background tinting.

#### Neutral Palette

| Token                  | Value     | Usage                                   |
| ---------------------- | --------- | --------------------------------------- |
| `--pro-text-primary`   | `#1e1e2e` | Headlines, table cell text, form values |
| `--pro-text-secondary` | `#6e6e80` | Labels, descriptions, secondary info    |
| `--pro-text-tertiary`  | `#9e9eae` | Placeholders, timestamps, hints         |
| `--pro-text-disabled`  | `#c4c4d0` | Disabled controls                       |
| `--pro-text-inverse`   | `#ffffff` | Text on primary/dark backgrounds        |

### 2.2 Surface Layers

Semantic naming for dark mode readiness. Never use `white` or `gray` in token names.

| Token               | Light Value          | Usage                                        |
| ------------------- | -------------------- | -------------------------------------------- |
| `--pro-bg-base`     | `#fafafc`            | Page background, app shell                   |
| `--pro-bg-elevated` | `#ffffff`            | Cards, modals, drawers, dropdowns            |
| `--pro-bg-sunken`   | `#f4f4f8`            | Table header, density toggle bg, inset areas |
| `--pro-bg-overlay`  | `rgba(30,30,46,0.4)` | Modal/drawer backdrop                        |

### 2.3 Border

| Token                  | Value     | Usage                                      |
| ---------------------- | --------- | ------------------------------------------ |
| `--pro-border-default` | `#e4e4ec` | Input borders, table cell borders          |
| `--pro-border-light`   | `#ededf3` | Card borders, dividers, section separators |
| `--pro-border-focus`   | `#7c6ce7` | Focus ring border (= primary)              |

### 2.4 Element Plus Override Map

```css
:root {
  /* Override Element Plus globals */
  --el-color-primary: var(--pro-color-primary);
  --el-color-primary-light-3: #a99aef;
  --el-color-primary-light-5: #bdb2f3;
  --el-color-primary-light-7: #d6d0f7;
  --el-color-primary-light-8: #e4e0f9;
  --el-color-primary-light-9: var(--pro-color-primary-light);
  --el-color-primary-dark-2: var(--pro-color-primary-hover);

  --el-color-success: var(--pro-color-success);
  --el-color-warning: var(--pro-color-warning);
  --el-color-danger: var(--pro-color-danger);
  --el-color-info: var(--pro-color-info);

  --el-bg-color: var(--pro-bg-elevated);
  --el-bg-color-page: var(--pro-bg-base);
  --el-bg-color-overlay: var(--pro-bg-elevated);

  --el-border-color: var(--pro-border-default);
  --el-border-color-light: var(--pro-border-light);

  --el-text-color-primary: var(--pro-text-primary);
  --el-text-color-regular: var(--pro-text-secondary);
  --el-text-color-secondary: var(--pro-text-tertiary);
  --el-text-color-placeholder: var(--pro-text-tertiary);
  --el-text-color-disabled: var(--pro-text-disabled);

  --el-border-radius-base: var(--pro-radius-sm);
  --el-border-radius-small: var(--pro-radius-xs);
  --el-border-radius-round: 20px;

  --el-font-family: var(--pro-font-family);
}
```

### 2.5 Dark Mode (Token Structure Only — P2)

All token names are semantic (surface, elevated, sunken — not white, gray). P2 adds:

```css
[data-theme='dark'] {
  --pro-text-primary: #e4e4ec;
  --pro-text-secondary: #9e9eae;
  --pro-bg-base: #16161e;
  --pro-bg-elevated: #1e1e2e;
  --pro-bg-sunken: #12121a;
  --pro-border-default: #2e2e3e;
  --pro-border-light: #252535;
  /* ... remaining overrides */
}
```

No component code changes needed — only CSS variable values swap.

---

## 3. Typography

### Font Stack

```css
--pro-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, 'Noto Sans SC', sans-serif;
--pro-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Noto Sans Mono', monospace;
```

### Scale

| Token              | Size | Weight  | Usage                               |
| ------------------ | ---- | ------- | ----------------------------------- |
| `--pro-text-xl`    | 24px | 700     | Stat card numbers                   |
| `--pro-text-lg`    | 16px | 600     | Modal titles, page headers          |
| `--pro-text-md`    | 15px | 600     | Card titles, toolbar titles         |
| `--pro-text-base`  | 14px | 450     | Description values, body text       |
| `--pro-text-sm`    | 13px | 400/500 | Table cells, form labels, buttons   |
| `--pro-text-xs`    | 12px | 500     | Tags, secondary info, timestamps    |
| `--pro-text-xxs`   | 11px | 500     | Hints, stat labels, group labels    |
| `--pro-text-micro` | 10px | 600     | Uppercase group labels, tiny badges |

### Font Weight Semantic Tokens

| Token                        | Value | Usage                                     |
| ---------------------------- | ----- | ----------------------------------------- |
| `--pro-font-weight-normal`   | 400   | Body text, descriptions                   |
| `--pro-font-weight-medium`   | 500   | Labels, secondary headings, nav items     |
| `--pro-font-weight-semibold` | 600   | Card titles, toolbar titles, table header |
| `--pro-font-weight-bold`     | 700   | Stat numbers, page headings               |

---

## 4. Spacing & Layout

### Spacing Scale

| Token            | Value | Usage                                         |
| ---------------- | ----- | --------------------------------------------- |
| `--pro-space-1`  | 4px   | Tight gaps (icon-text, tag padding vertical)  |
| `--pro-space-2`  | 6px   | Form item label-to-input gap                  |
| `--pro-space-3`  | 8px   | Inline element gaps (buttons, nav items)      |
| `--pro-space-4`  | 12px  | Card internal sections, table cell padding    |
| `--pro-space-5`  | 16px  | Grid gaps, form grid gaps                     |
| `--pro-space-6`  | 20px  | Card padding, section spacing                 |
| `--pro-space-7`  | 24px  | Card horizontal padding, main content padding |
| `--pro-space-8`  | 32px  | Section separators, large gaps                |
| `--pro-space-9`  | 40px  | Modal overlay padding                         |
| `--pro-space-10` | 48px  | Page-level spacing                            |

### Density Scales

Three density levels controlled by `ProConfigProvider`. Each density adjusts spacing, font sizes, and heights proportionally.

| Token                          | Compact | Default | Relaxed |
| ------------------------------ | ------- | ------- | ------- |
| `--pro-density-row-height`     | 36px    | 44px    | 52px    |
| `--pro-density-cell-padding-v` | 6px     | 10px    | 14px    |
| `--pro-density-cell-padding-h` | 12px    | 16px    | 20px    |
| `--pro-density-input-height`   | 28px    | 36px    | 40px    |
| `--pro-density-btn-height`     | 28px    | 36px    | 40px    |
| `--pro-density-form-gap`       | 8px     | 16px    | 20px    |
| `--pro-density-font-size`      | 12px    | 13px    | 14px    |

Implementation: `ProConfigProvider` sets a `data-density` attribute on its root element. CSS uses attribute selectors:

```css
[data-density='compact'] {
  --pro-density-row-height: 36px; /* ... */
}
[data-density='default'] {
  --pro-density-row-height: 44px; /* ... */
}
[data-density='relaxed'] {
  --pro-density-row-height: 52px; /* ... */
}
```

---

## 5. Shape & Elevation

### 5.1 Border Radius (Layered)

| Token               | Value | Layer        | Usage                                          |
| ------------------- | ----- | ------------ | ---------------------------------------------- |
| `--pro-radius-xl`   | 16px  | Container L1 | Modals, drawers                                |
| `--pro-radius-lg`   | 12px  | Container L2 | Cards, popovers                                |
| `--pro-radius-md`   | 8px   | Component    | Stat cards, dependency graph nodes             |
| `--pro-radius-sm`   | 6px   | Control      | Buttons, inputs, selects, density toggle items |
| `--pro-radius-xs`   | 4px   | Micro        | Checkboxes, inline code, version badges        |
| `--pro-radius-pill` | 20px  | Tags         | Pill-shaped tags, badges                       |
| `--pro-radius-full` | 50%   | Avatar       | Circular avatars                               |

### 5.2 Shadow Scale

| Token                       | Value                                                             | Usage                      |
| --------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `--pro-shadow-sm`           | `0 1px 3px rgba(30,30,46,0.04), 0 1px 2px rgba(30,30,46,0.06)`    | Cards, elevated surfaces   |
| `--pro-shadow-md`           | `0 4px 12px rgba(30,30,46,0.06), 0 2px 4px rgba(30,30,46,0.04)`   | Dropdown, popover          |
| `--pro-shadow-lg`           | `0 12px 36px rgba(30,30,46,0.08), 0 4px 12px rgba(30,30,46,0.04)` | Modal, drawer              |
| `--pro-shadow-focus`        | `0 0 0 3px rgba(124,108,231,0.1)`                                 | Focus ring (input, button) |
| `--pro-shadow-focus-danger` | `0 0 0 3px rgba(224,85,85,0.1)`                                   | Error focus ring           |

---

## 6. Motion

### Timing Tokens

| Token                     | Value                                     | Usage                                      |
| ------------------------- | ----------------------------------------- | ------------------------------------------ |
| `--pro-transition-fast`   | `150ms cubic-bezier(0.25, 0.1, 0.25, 1)`  | Hover, focus, color transitions            |
| `--pro-transition-normal` | `250ms cubic-bezier(0.25, 0.1, 0.25, 1)`  | Expand/collapse, panel slide               |
| `--pro-transition-bounce` | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Density switch, step transition, drag snap |
| `--pro-transition-slow`   | `500ms cubic-bezier(0.25, 0.1, 0.25, 1)`  | Modal open/close, drawer slide             |

### Motion Rules

1. **Data rendering: no animation.** Table rows, pagination changes, data refresh — instant. Never animate data-bound content.
2. **State transitions: CSS transitions.** Hover, active, focus, disabled state changes use `--pro-transition-fast`.
3. **Layout changes: smooth.** QueryFilter collapse/expand, density switch, ColumnSetting toggle use `--pro-transition-normal`.
4. **Entrance/exit: deliberate.** Modal/drawer open-close use `--pro-transition-slow` with transform + opacity.
5. **Drag interactions: bounce snap.** ColumnSetting drag-to-reorder uses `--pro-transition-bounce` for the snap-into-place effect.
6. **Reduced motion: respect `prefers-reduced-motion`.** All transitions go to 0ms when user prefers reduced motion.

### Specific Animations

| Component      | Trigger       | Animation                                                         |
| -------------- | ------------- | ----------------------------------------------------------------- |
| Modal          | Open          | Fade overlay (0→0.4 opacity) + scale dialog (0.95→1) + fade (0→1) |
| Modal          | Close         | Reverse of open                                                   |
| Drawer         | Open          | Slide from right/bottom + fade overlay                            |
| QueryFilter    | Collapse      | Height transition (auto→collapsed) + opacity on hidden fields     |
| Density toggle | Switch        | Active indicator slides with bounce easing                        |
| ColumnSetting  | Drag          | Ghost follows cursor, drop zone highlights, snap with bounce      |
| StepsForm      | Step advance  | Current step fades out left, next step fades in from right        |
| Tag            | Appear/remove | Scale (0.8→1) + opacity (0→1), 150ms                              |

---

## 7. Component Visual Specs

### 7.1 ProTable

#### Card Container

- Background: `--pro-bg-elevated`
- Border: `1px solid --pro-border-light`
- Border radius: `--pro-radius-lg` (12px)
- Shadow: `--pro-shadow-sm`
- Sections stacked vertically: QueryFilter → ToolBar → Table → Pagination
- Section dividers: `1px solid --pro-border-light`

#### QueryFilter

- Padding: `20px 24px 16px`
- Layout: CSS Grid, `repeat(N, 1fr) auto` where N = visible fields (default 3 before collapse)
- Label: `--pro-text-xs` (12px), `--pro-font-weight-medium`, `--pro-text-secondary`, `letter-spacing: 0.02em`
- Label position: above input (not inline-left like Element Plus)
- Input height: `--pro-density-input-height`
- Actions group: Search (primary btn) + Reset (default btn) + Collapse toggle (text btn)
- Collapse button text: "Expand ↓" / "Collapse ↑" with `aria-expanded`
- Collapsed state: hides fields beyond threshold, smooth height transition

#### ToolBar

- Height: auto (padding-based), padding: `12px 24px`
- Left side: Title (`--pro-text-md`, `--pro-font-weight-semibold`) + Count badge (`--pro-bg-sunken`, pill shape)
- Right side: Density toggle + divider + icon buttons + divider + primary action button
- **Density toggle**: Segmented control style (not dropdown). `--pro-bg-sunken` container, active item gets `--pro-bg-elevated` + `--pro-shadow-sm` + `--pro-color-primary` text. Slide animation on switch.
- Icon buttons: 32×32px, `--pro-radius-sm`, hover shows `--pro-bg-sunken`
- Divider: 1px × 20px vertical line, `--pro-border-light`

#### Table

- Header: `--pro-bg-sunken` background, `--pro-text-xs` uppercase labels, `letter-spacing: 0.04em`
- Cell padding: `--pro-density-cell-padding-v` × `--pro-density-cell-padding-h`
- Cell text: `--pro-text-sm` (13px)
- Row hover: `rgba(124,108,231,0.02)` — barely perceptible, identifies the row without being distracting
- Row selected: `--pro-color-primary-ultra-light` background
- Checkbox: 16×16px, `--pro-radius-xs`, checked = `--pro-color-primary` fill + white checkmark
- Cell borders: bottom only, `1px solid --pro-border-light`, last row no border

#### Pagination

- Padding: `12px 24px`
- Info text: `--pro-text-xs`, `--pro-text-tertiary` — "Showing 1–20 of 128"
- Page buttons: 30×30px, `--pro-radius-sm`, active = `--pro-color-primary` bg + white text
- No extra border/shadow — integrated into card footer

#### Value Type Formatting

- **Money**: `¥1,234.56` — right-aligned, monospace font
- **Percent**: `85.2%` — right-aligned with optional mini bar
- **Status tags**: Pill-shaped (`--pro-radius-pill`), semantic color `-light` bg + base text
- **Date/DateTime**: `--pro-text-secondary` color, relative time for recent ("2h ago"), absolute for older
- **Image**: 32×32px thumbnail, `--pro-radius-xs`, object-fit cover
- **Code**: `--pro-font-mono`, `--pro-bg-sunken` background, `--pro-radius-xs` padding
- **Progress**: 6px height bar, `--pro-radius-full`, primary gradient fill

#### Avatar Column

- 28×28px circle, gradient background generated from initials hash
- Gradient formula: initials → hash → pick from 6 gradient pairs:
  - Purple: `linear-gradient(135deg, #7c6ce7, #9d8df0)`
  - Green: `linear-gradient(135deg, #45b080, #6bc99d)`
  - Amber: `linear-gradient(135deg, #e5a336, #f0be5c)`
  - Red: `linear-gradient(135deg, #e05555, #f07070)`
  - Blue: `linear-gradient(135deg, #5b8ce7, #7da8f0)`
  - Gray: `linear-gradient(135deg, #6e6e80, #9898a8)`
- Text: 11px, weight 600, white, uppercase initials

### 7.2 ProForm

#### Card Form

- Same card container as ProTable
- Header: title + optional subtitle (`--pro-text-tertiary`, 12px)
- Form body padding: `24px`
- Grid: `grid-template-columns: 1fr 1fr`, gap: `16px 24px`
- Full-width fields: `grid-column: 1 / -1`

#### Form Item

- Label: `--pro-text-sm` (13px), `--pro-font-weight-medium`, `--pro-text-primary`
- Required marker: `--pro-color-danger` asterisk after label text
- Gap label→input: `--pro-space-2` (6px)
- Hint text: `--pro-text-xxs` (11px), `--pro-text-tertiary`
- Error text: `--pro-text-xxs`, `--pro-color-danger`

#### Input States

- Default: `--pro-border-default` border, `--pro-bg-elevated` bg
- Focus: `--pro-border-focus` border + `--pro-shadow-focus` ring
- Error: `--pro-color-danger` border
- Error + focus: `--pro-color-danger` border + `--pro-shadow-focus-danger` ring
- Disabled: `--pro-bg-sunken` bg, `--pro-text-disabled` text

#### Switch

- Track: 36×20px, border-radius pill, default `--pro-border-default`, active `--pro-color-primary`
- Thumb: 16×16px circle, white, `box-shadow: 0 1px 3px rgba(0,0,0,0.15)`
- Transition: `--pro-transition-fast` on both track color and thumb position

#### Form Actions

- Separated by `1px solid --pro-border-light` top border
- Aligned right, gap `--pro-space-3` (8px)
- Primary action on the right (most accessible position)

### 7.3 ModalForm

- Overlay: `--pro-bg-overlay` (rgba dark with 0.4 opacity)
- Modal container: `--pro-radius-xl` (16px), `--pro-shadow-lg`, max-width 480px for simple forms / 640px for complex
- Header: `20px 24px 16px` padding, title `--pro-text-lg` (16px, 600), close button 28×28 circle
- Body: `0 24px 24px` padding, single-column layout (narrower than card form)
- Footer: `16px 24px` padding, top border, right-aligned buttons

### 7.4 DrawerForm

- Slides from right (default) or bottom (mobile)
- Width: 480px (default), 640px (wide variant)
- Same header/body/footer structure as ModalForm but full height
- Shadow: `--pro-shadow-lg` on the leading edge

### 7.5 StepsForm

- Steps bar: horizontal dot + connector line layout
- **Step dot**: 28×28px circle
  - Completed: `--pro-color-primary` bg, white `✓` icon
  - Active: `--pro-color-primary` bg, white number, `0 0 0 4px rgba(124,108,231,0.15)` glow ring
  - Pending: `--pro-bg-sunken` bg, `--pro-text-tertiary` number
- **Connector line**: 2px height, completed = `--pro-color-primary`, pending = `--pro-border-light`
- **Step label**: `--pro-text-sm`, `--pro-font-weight-medium`, pending = `--pro-text-tertiary`
- Form area: same form grid as ProForm, padding `20px 24px`
- Navigation: space-between layout, "← Previous" (default btn) left, "Next Step →" (primary btn) right
- Step transition: current fields fade-slide out, next fields fade-slide in (250ms)

### 7.6 ProDescriptions

- Same card container
- Header: can include avatar + title composite (for profile-like views)
- Content: CSS Grid, default 3 columns
- **Description item**: label on top (`--pro-text-xs`, `--pro-text-tertiary`, `letter-spacing: 0.02em`), value below (`--pro-text-base`, `--pro-font-weight-medium`)
- Items separated by bottom border `--pro-border-light`, last row no border
- Full-width items: `grid-column: 1 / -1` for long text values
- Value types formatted same as ProTable cell values (tags, dates, money, etc.)

### 7.7 ColumnSetting

- Trigger: toolbar icon button, opens a popover/dropdown panel
- Panel: `--pro-radius-lg`, `--pro-shadow-md`, max-height 400px scrollable
- Each column row: checkbox + label + fixed-position controls (pin left/right)
- Drag handle: 6-dot grip icon on the left
- Drag state: item lifts with `--pro-shadow-md`, slight scale (1.02), `--pro-color-primary-light` bg
- Drop zone: 2px `--pro-color-primary` top/bottom line indicator
- Snap: `--pro-transition-bounce` on release

---

## 8. Platform Dashboard Visual Spec

### 8.1 Layout Shell

- **Sidebar**: 220px width, `--pro-bg-elevated`, right border `--pro-border-light`
  - Logo area: 28px icon (gradient `--pro-color-primary`) + text, padding bottom 16px
  - Nav groups: uppercase label (`--pro-text-micro`, `letter-spacing: 0.08em`, `--pro-text-tertiary`)
  - Nav items: 13px, icon 18px, `--pro-radius-sm` corners
  - Active item: `--pro-color-primary-light` bg, `--pro-color-primary` text, `--pro-font-weight-medium`
  - Hover: `--pro-bg-sunken` bg
- **Top bar**: `--pro-bg-elevated`, bottom border, breadcrumb left + user right
- **Content area**: `--pro-bg-base`, padding `20px 24px`

### 8.2 Dashboard Page

**Stat Cards Row (4 columns):**

- `--pro-bg-elevated`, `--pro-radius-md`, `--pro-border-light` border
- Label: `--pro-text-xxs`, uppercase, `letter-spacing: 0.04em`, `--pro-text-tertiary`
- Value: `--pro-text-xl` (24px), `--pro-font-weight-bold`
- Change: `--pro-text-xxs`, success/danger color for up/down trends

**Recent Versions Table:**

- Standard ProTable visual (inside card) but simplified — no QueryFilter, minimal toolbar
- Version column: monospace badge (`--pro-font-mono`, `--pro-bg-sunken`, `--pro-radius-xs`)
- Status: pill tags (Active=success, Grayscale=warning, Deprecated=info)

**Active Grayscale Panel:**

- Card with list of grayscale rules
- Each rule: package→version label + percentage + progress bar
- Progress bar: 6px height, `--pro-radius-full`, gradient fill `linear-gradient(90deg, --pro-color-primary, #9d8df0)`
- Rule tags: `--pro-color-primary-light` bg pills showing rule type and params

**Dependency Graph:**

- Card with embedded DAG visualization (rendered by dagre)
- Node: `--pro-bg-elevated`, `--pro-border-default`, `--pro-radius-sm`, 11px `--pro-font-weight-medium`
- Highlighted node: `--pro-color-primary-light` bg, `--pro-color-primary` border
- Edge: `--pro-border-default` color, 1.5px stroke, with arrowhead
- Peer dep annotation: inline text, `--pro-text-tertiary`, `--pro-text-xxs`

### 8.3 Version Management Page

- ProTable with columns: Package, Version (monospace badge), Status (tag), Published (relative time), Actions
- ToolBar actions: "Publish New" primary button
- Row expand: shows version detail (ProDescriptions), dependency tree, SRI hash
- Version state machine visualization: horizontal flow diagram showing `uploading → propagating → verifying → active` with current state highlighted

### 8.4 Grayscale Management Page

- List view (ProTable) of all rules with: Package, Target Version, Rule Type (pill), Coverage (progress bar + percentage), Status, Actions
- "Create Rule" opens ModalForm with:
  - Package selector
  - Target version selector
  - Rule builder: add conditions (user_list, department, percentage), composite AND/OR
  - Warning banner when target app has pinned version (grayscale override notice)
- Rule detail: DrawerForm with real-time coverage preview, audit log timeline

### 8.5 Compatibility Matrix Page

- N×M grid where rows = package@version, columns = peer dependency versions
- Cell states: ✓ compatible (success-light bg), ✗ incompatible (danger-light bg), ○ untested (info-light bg), ⟳ testing (primary-light bg + spinner)
- Fixed first column (package names) and first row (peer versions) for scroll
- Hover shows tooltip with test details and timestamp

### 8.6 Import Map Debug Page

- Input: app ID + optional user ID
- Output: resolved import map JSON with syntax highlighting
- Side panel: resolution trace showing decision path (which grayscale rule applied, which pin used, which version resolved)
- Visual diff: compare two import maps side by side (before/after version change)

---

## 9. ProConfigProvider

Central configuration component that controls the visual behavior of all Pro Components within its subtree.

```vue
<ProConfigProvider density="default" locale="en-US" theme="light">
  <!-- All Pro Components inherit these settings -->
</ProConfigProvider>
```

### Props

| Prop      | Type                                  | Default     | Description                       |
| --------- | ------------------------------------- | ----------- | --------------------------------- |
| `density` | `'compact' \| 'default' \| 'relaxed'` | `'default'` | Global density level              |
| `locale`  | `string`                              | `'en-US'`   | Locale for date/number formatting |
| `theme`   | `'light' \| 'dark'`                   | `'light'`   | Color theme (P2 for dark)         |

### Implementation

- Sets `data-density` and `data-theme` attributes on root element
- Provides config via Vue `provide/inject`
- All Pro Components read density from injection, fall back to DOM attribute, fall back to default
- Nesting supported: inner `ProConfigProvider` overrides outer for its subtree

---

## 10. Icon Strategy

Pro Components do not ship a custom icon set. Strategy:

1. **Element Plus icons** for controls that extend EP components (form controls, table operations)
2. **Lucide icons** (`lucide-vue-next`) for Pro-specific UI: toolbar actions, nav icons, status indicators
3. **No mixing** within a single component — pick one icon set per component scope
4. Icons sized at 14–18px for inline use, 20–24px for standalone buttons
5. Icon color inherits from parent `color` property (no hardcoded fills)

---

## 11. Responsive Behavior

| Breakpoint | Width      | Behavior                                                                                                    |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Desktop    | ≥1200px    | Full layout: sidebar + content, ProTable default density                                                    |
| Tablet     | 768–1199px | Collapsible sidebar (icon-only), ProTable compact density auto                                              |
| Mobile     | <768px     | No sidebar (hamburger menu), ProTable horizontal scroll, ModalForm → full-screen, DrawerForm → bottom sheet |

### ProTable Responsive

- Columns with `responsive: 'hide-md'` hidden below 1200px
- Columns with `responsive: 'hide-sm'` hidden below 768px
- QueryFilter: 3 columns → 2 → 1 based on container width (not viewport — uses container queries)

### ProForm Responsive

- 2-column grid → 1-column below 640px container width
- ModalForm max-width → 100% on mobile with full-screen appearance
- StepsForm steps bar: horizontal → vertical on mobile

---

## 12. Deferred (P2)

- Dark mode color values (token structure ready in P1)
- High contrast mode
- RTL layout support
- Custom theme builder (visual token editor)
- Animation config (enable/disable per component)
- Compact sidebar mode (icon-only with tooltips)
