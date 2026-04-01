# shadcn New York Theme Migration — Design Spec

> **Date**: 2026-04-01
> **Status**: Approved
> **Scope**: `packages/themes` + component SFC style extraction

## Goal

Migrate Pro Components from "Soft Lavender" theme to **shadcn New York (Neutral)** visual system with **Blue-600 primary**, achieving enterprise SaaS-grade unified UI across all Element Plus components.

## Design Decisions

| Decision          | Choice                            | Rationale                                       |
| ----------------- | --------------------------------- | ----------------------------------------------- |
| shadcn variant    | New York                          | Tighter, heavier font-weight, more professional |
| Gray scale        | Neutral (hue=0)                   | Pure gray, no color tint                        |
| Primary color     | `#2563eb` (blue-600)              | Stable, professional, data-product standard     |
| Dark primary      | `#3b82f6` (blue-500)              | Brighter for contrast on dark bg                |
| Border radius     | `0.5rem` (8px)                    | Standard New York radius                        |
| Dark mode         | Yes, simultaneous                 | Both modes aligned to shadcn Neutral            |
| Override scope    | Global EP + Pro components        | All EP components get unified style             |
| Override strategy | Extract from SFC → themes package | Centralized, DRY, cascade-layer controlled      |

## Token Mapping

### primitives.css — Light Mode

```css
:root {
  /* Primary (Blue-600) */
  --pro-color-primary: #2563eb;
  --pro-color-primary-hover: #1d4ed8; /* blue-700 */
  --pro-color-primary-active: #1e40af; /* blue-800 */
  --pro-color-primary-light: #eff6ff; /* blue-50 */
  --pro-color-primary-ultra-light: #f8faff;

  /* Semantic */
  --pro-color-success: #16a34a; /* green-600 */
  --pro-color-success-light: #f0fdf4; /* green-50 */
  --pro-color-warning: #d97706; /* amber-600 */
  --pro-color-warning-light: #fffbeb; /* amber-50 */
  --pro-color-danger: #dc2626; /* red-600, shadcn destructive */
  --pro-color-danger-light: #fef2f2; /* red-50 */
  --pro-color-info: #737373; /* neutral-500 */
  --pro-color-info-light: #f5f5f5; /* neutral-100 */

  /* Spacing — unchanged */
  /* Border Radius — switch to rem */
  --pro-radius-xl: 1rem; /* 16px */
  --pro-radius-lg: 0.75rem; /* 12px */
  --pro-radius-md: 0.5rem; /* 8px — shadcn base */
  --pro-radius-sm: 0.375rem; /* 6px */
  --pro-radius-xs: 0.25rem; /* 4px */
  --pro-radius-pill: 1.25rem;
  --pro-radius-full: 50%;

  /* Typography — add Inter */
  --pro-font-family:
    Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
}
```

### semantic.css — Light Mode

```css
:root {
  /* Text */
  --pro-text-primary: #0a0a0a; /* neutral-950 */
  --pro-text-secondary: #737373; /* neutral-500 */
  --pro-text-tertiary: #a3a3a3; /* neutral-400 */
  --pro-text-disabled: #d4d4d4; /* neutral-300 */
  --pro-text-inverse: #fafafa; /* neutral-50 */

  /* Surface */
  --pro-bg-base: #ffffff; /* pure white */
  --pro-bg-elevated: #ffffff;
  --pro-bg-sunken: #f5f5f5; /* neutral-100 */
  --pro-bg-overlay: rgba(10, 10, 10, 0.5);

  /* Border */
  --pro-border-default: #e5e5e5; /* neutral-200 */
  --pro-border-light: #f0f0f0; /* ~neutral-100 */
  --pro-border-focus: var(--pro-color-primary);

  /* Shadow */
  --pro-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --pro-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --pro-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --pro-shadow-focus: 0 0 0 3px rgba(37, 99, 235, 0.15);
  --pro-shadow-focus-danger: 0 0 0 3px rgba(220, 38, 38, 0.15);

  /* Scrollbar */
  --pro-scrollbar-thumb: #d4d4d4; /* neutral-300 */
  --pro-scrollbar-thumb-hover: #a3a3a3;
}
```

### dark.css

```css
[data-theme='dark'] {
  --pro-text-primary: #fafafa;
  --pro-text-secondary: #a3a3a3;
  --pro-text-tertiary: #737373;
  --pro-text-disabled: #525252;
  --pro-text-inverse: #0a0a0a;

  --pro-bg-base: #0a0a0a;
  --pro-bg-elevated: #171717;
  --pro-bg-sunken: #0a0a0a;
  --pro-bg-overlay: rgba(0, 0, 0, 0.7);

  --pro-border-default: #262626;
  --pro-border-light: #1c1c1c;

  --pro-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --pro-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --pro-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
  --pro-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.25);

  --pro-color-primary: #3b82f6;
  --pro-color-primary-hover: #2563eb;
  --pro-color-primary-active: #1d4ed8;
  --pro-color-primary-light: #172554;
  --pro-color-primary-ultra-light: #0f172a;

  --pro-scrollbar-thumb: #404040;
  --pro-scrollbar-thumb-hover: #525252;
}
```

## Override File Structure

```
themes/src/overrides/
  element-plus.css      ← --el-* variable mapping (existing, update values)
  components.css        ← NEW: global EP component visual overrides
  form.css              ← NEW: shared form focus/error/label styles
  table.css             ← NEW: el-table header/cell/hover/scrollbar
  descriptions.css      ← NEW: el-descriptions label/content/border
  steps.css             ← NEW: el-steps head/line/title
  dialog.css            ← NEW: el-dialog/el-drawer header/body
```

### Override Extraction Rules

1. `:deep(.el-xxx)` rules → extracted to themes override files, selector becomes `.pro-xxx .el-xxx`
2. Shared form patterns use `:where()` for zero extra specificity
3. Layout-only styles (flex, padding, gap, width) stay in component SFCs
4. All overrides placed in `pro.el-overrides` cascade layer

### Global EP Components Covered (components.css)

- Button: default border variant, primary solid, consistent hover
- Input/Select/DatePicker: unified focus ring (blue), border color
- Tag: pill radius, lighter palette
- Dialog/Drawer: no header border, unified padding
- Popover: unified radius + shadow
- Table: header bg, hover row, border style
- Pagination: compact, active color
- Message/Notification: radius + shadow alignment
- Tabs: underline style, active uses primary
- Checkbox/Radio: primary color alignment
- Switch: primary color
- Steps: primary color alignment

## Component SFC Changes

Files with `:deep()` rules to remove (keep layout styles only):

- `pro-table/src/ProTable.vue`
- `pro-table/src/components/QueryFilter.vue`
- `pro-table/src/components/ToolBar.vue`
- `pro-table/src/components/ColumnSetting.vue`
- `pro-form/src/ProForm.vue`
- `pro-form/src/components/QueryFilter.vue`
- `pro-form/src/components/StepsForm.vue`
- `pro-form/src/components/DrawerForm.vue`
- `pro-form/src/components/ModalForm.vue`
- `pro-descriptions/src/ProDescriptions.vue`

## Cascade Layer Order

```css
@layer pro.reset, pro.tokens, pro.el-overrides, pro.components;
```

- `pro.tokens` — primitives, semantic, density, dark
- `pro.el-overrides` — element-plus variable map + all component overrides
- `pro.components` — Pro component own styles (from SFCs)

## Validation Criteria

1. `pnpm build` passes all packages
2. `pnpm type-check` no errors
3. `pnpm lint` no errors
4. VitePress docs: ProTable / ProForm / ProDescriptions demos visually correct
5. Light + dark mode both verified
6. Raw EP components (el-button, el-input, etc.) get unified style automatically
