---
'@pro/table': patch
'@pro/form': patch
'@pro/tree': patch
'@pro/tabs': patch
'@pro/loading': patch
'@pro/result': patch
'@pro/empty': patch
'@pro/tag': patch
'@pro/hooks': patch
'@pro/locale': patch
'@pro/themes': patch
'@pro/utils': patch
'@pro/select': patch
---

fix: 10-round component polish — industry-grade quality pass

Round 1 (Critical): Fix ModalForm/DrawerForm cancel i18n key, QueryFilter hardcoded placeholders, ProTable `as any`, ProTree broken event handlers
Round 2 (Reactivity): ProFormList stable v-for keys, mutation path via setFieldValue, isDirty deep comparison, reactive field definitions
Round 3 (i18n): Locale-aware number/money/date formatters, formatRelativeTime locale param, remove hardcoded searchPlaceholder
Round 4 (Type Safety): ProTabs tab-click typed properly, usePagination NaN guard, useEditable async validator support
Round 5 (Accessibility): ToolBar keyboard navigation + aria, ProLoading aria-live, ProEmpty imageAlt prop
Round 6 (Theme Tokens): Define --pro-text-quaternary, fix --pro-radius-full (50% → 9999px), tokenize descriptions/tabs hardcoded px
Round 7 (Edge Cases): ProLoading delay prop implementation, ProEmpty slot collision fix, StepsForm submit guard, ColumnSetting localStorage validation
Round 8 (API Gaps): ProResult 404 icon fix, ProDescriptions descriptionsSpan, ProTag CSS color-mix
Round 9 (Cleanup): usePagination URL sync pollution, ProDescriptions inline style tokens, EditableConfig dead code
Round 10 (Final): Verify all fixes, create changeset, clean artifacts
