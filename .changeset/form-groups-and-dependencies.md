---
'@pro/form': minor
'@pro/utils': minor
---

feat(form): field groups, colSpan, visible() callback, ModalForm/DrawerForm overhaul

- ProFieldGroup: collapsible sections with title, custom columns per group
- ProFormItem union type: mix fields and groups in form definition
- colSpan: logical column span (number | 'full') for responsive grid
- visible(): declarative field-level conditional rendering based on form values
- resetOnDependencyChange: auto-clear field when dependency changes
- ModalForm/DrawerForm: trigger slot (Ant Design pattern), footer actions, columns prop
- Fix form controls width: all inputs/selects/date-pickers fill column width
- Fix inline mode: label-position left with auto width, distinct from horizontal
