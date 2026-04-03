---
'@pro/table': minor
'@pro/tree': minor
'@pro/select': minor
'@pro/form': patch
---

feat: add virtual scrolling for large datasets

- ProTable: ElTableV2 dual-engine with `virtual` prop, ElAutoResizer for responsive sizing, client-side auto-pagination for data prop mode
- ProTree: ElTreeV2 with `virtual` prop for 500+ node trees, search/filter/expand-all adapted
- Select: ElSelectV2 with `virtual` prop for large option lists, wired through ProFormField
- ProFormList: fix clone-per-keystroke performance bug (in-place mutation)
