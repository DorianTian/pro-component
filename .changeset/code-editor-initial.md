---
"@pro/code-editor": minor
---

feat(code-editor): add @pro/code-editor — Monaco-based IDE component

- CodeEditor: v-model binding, toolbar (format/search/command palette), status bar
  (Ln/Col/errors/warnings/language/encoding), dark/light theme, read-only badge,
  all Monaco options reactive via props
- DiffEditor: side-by-side and inline diff, original/modified binding
- CodeEditorTabs: VS Code-style multi-tab editor with per-tab model/viewState,
  closable tabs, language badges, active tab indicator
- useCodeEditor composable: headless Monaco lifecycle, reactive cursor/selection/
  diagnostics tracking, format/search/command-palette/undo/redo actions
- 13 languages: JavaScript, TypeScript, SQL, Python, Go, Bash, JSON, HTML, CSS,
  Markdown, YAML, XML, Plain Text
- 4 themes: vs, vs-dark, hc-black, hc-light
- 7 demos: basic, multi-language, diff, themes, read-only, SQL, full-featured, tabs
