---
'@pro/editor': minor
---

feat(editor): add @pro/editor — TipTap-based rich text editor

- RichEditor component with full toolbar: bold, italic, underline, strikethrough,
  inline code, headings (H1-H3), bullet/ordered/task lists, blockquote, code block,
  horizontal rule, link, image, table (resizable), text color, highlight, undo/redo
- v-model:html binding with two-way sync
- Configurable toolbar via `toolbar` prop (array of action names)
- Word count and character count in footer bar
- Character limit with visual indicator
- Read-only mode (toolbar hidden, content not editable)
- Placeholder text support
- Focus ring on container
- ProseMirror content styling: headings, lists, task lists, blockquotes, code blocks,
  tables, links, images, horizontal rules, highlights
- 3 demos: basic (full-featured), read-only toggle, character limit
