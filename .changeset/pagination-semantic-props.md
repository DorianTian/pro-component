---
"@pro/pagination": minor
"@pro/hooks": minor
---

feat(pagination): rewrite as SFC with semantic props + enhance usePagination

- New props: autoHide, compact, showQuickJumper, showSizeChanger, showTotal, totalFormatter, background, disabled
- usePagination: add isFirstPage/isLastPage computed, syncURL option for query param sync
- Fix vertical alignment in VitePress docs (undo .vp-doc li margin interference)
