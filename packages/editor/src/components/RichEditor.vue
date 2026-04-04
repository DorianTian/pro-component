<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'

import type { ToolbarAction } from '../types'

defineOptions({ name: 'RichEditor' })

interface Props {
  /** HTML content (v-model) */
  modelValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Read-only mode */
  readOnly?: boolean
  /** Maximum character count (0 = unlimited) */
  maxLength?: number
  /** Minimum editor height in px */
  minHeight?: number
  /** Maximum editor height in px (0 = no limit) */
  maxHeight?: number
  /** Show the toolbar */
  showToolbar?: boolean
  /** Show word/character count in footer */
  showWordCount?: boolean
  /** Auto-focus on mount */
  autoFocus?: boolean
  /** Toolbar actions to display */
  toolbar?: ToolbarAction[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Start writing...',
  readOnly: false,
  maxLength: 0,
  minHeight: 200,
  maxHeight: 0,
  showToolbar: true,
  showWordCount: true,
  autoFocus: false,
  toolbar: () => [
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'heading1',
    'heading2',
    'heading3',
    'bulletList',
    'orderedList',
    'taskList',
    'blockquote',
    'codeBlock',
    'horizontalRule',
    'link',
    'image',
    'table',
    'color',
    'highlight',
    'undo',
    'redo',
  ],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  focus: []
  blur: []
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.readOnly,
  autofocus: props.autoFocus,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    Image.configure({ inline: false, allowBase64: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: props.placeholder }),
    CharacterCount.configure({ limit: props.maxLength > 0 ? props.maxLength : undefined }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({ nested: true }),
  ],
  onUpdate({ editor: ed }) {
    const html = ed.getHTML()
    emit('update:modelValue', html)
    emit('change', html)
  },
  onFocus() {
    emit('focus')
  },
  onBlur() {
    emit('blur')
  },
})

// Sync external v-model → editor
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return
    if (editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  },
)

// Sync readOnly
watch(
  () => props.readOnly,
  (val) => editor.value?.setEditable(!val),
)

onBeforeUnmount(() => editor.value?.destroy())

const wordCount = computed(() => {
  if (!editor.value) return 0
  return editor.value.storage.characterCount?.words() ?? 0
})

const charCount = computed(() => {
  if (!editor.value) return 0
  return editor.value.storage.characterCount?.characters() ?? 0
})

const contentStyle = computed(() => {
  const s: Record<string, string> = { minHeight: `${props.minHeight}px` }
  if (props.maxHeight > 0) s.maxHeight = `${props.maxHeight}px`
  return s
})

// --- Toolbar actions ---
function has(action: ToolbarAction): boolean {
  return props.toolbar.includes(action)
}

function toggleBold(): void {
  editor.value?.chain().focus().toggleBold().run()
}
function toggleItalic(): void {
  editor.value?.chain().focus().toggleItalic().run()
}
function toggleUnderline(): void {
  editor.value?.chain().focus().toggleUnderline().run()
}
function toggleStrike(): void {
  editor.value?.chain().focus().toggleStrike().run()
}
function toggleCode(): void {
  editor.value?.chain().focus().toggleCode().run()
}
function setHeading(level: 1 | 2 | 3): void {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}
function toggleBulletList(): void {
  editor.value?.chain().focus().toggleBulletList().run()
}
function toggleOrderedList(): void {
  editor.value?.chain().focus().toggleOrderedList().run()
}
function toggleTaskList(): void {
  editor.value?.chain().focus().toggleTaskList().run()
}
function toggleBlockquote(): void {
  editor.value?.chain().focus().toggleBlockquote().run()
}
function toggleCodeBlock(): void {
  editor.value?.chain().focus().toggleCodeBlock().run()
}
function insertHorizontalRule(): void {
  editor.value?.chain().focus().setHorizontalRule().run()
}
function insertLink(): void {
  const url = window.prompt('Enter URL:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}
function insertImage(): void {
  const url = window.prompt('Enter image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}
function insertTable(): void {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
function handleUndo(): void {
  editor.value?.chain().focus().undo().run()
}
function handleRedo(): void {
  editor.value?.chain().focus().redo().run()
}

function isActive(name: string, attrs?: Record<string, unknown>): boolean {
  return editor.value?.isActive(name, attrs) ?? false
}

defineExpose({
  getEditor: () => editor.value,
  getHTML: () => editor.value?.getHTML() ?? '',
  getText: () => editor.value?.getText() ?? '',
  getJSON: () => editor.value?.getJSON() ?? {},
  setContent: (html: string) => editor.value?.commands.setContent(html),
  clearContent: () => editor.value?.commands.clearContent(),
  focus: () => editor.value?.commands.focus(),
  wordCount,
  charCount,
})
</script>

<template>
  <div class="pro-rich-editor" :class="{ 'pro-rich-editor--readonly': readOnly }">
    <!-- Toolbar -->
    <div v-if="showToolbar && !readOnly" class="pro-rich-editor__toolbar">
      <!-- Text formatting -->
      <button
        v-if="has('bold')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('bold') }"
        title="Bold"
        @click="toggleBold"
      >
        <strong>B</strong>
      </button>
      <button
        v-if="has('italic')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('italic') }"
        title="Italic"
        @click="toggleItalic"
      >
        <em>I</em>
      </button>
      <button
        v-if="has('underline')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('underline') }"
        title="Underline"
        @click="toggleUnderline"
      >
        <u>U</u>
      </button>
      <button
        v-if="has('strike')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('strike') }"
        title="Strikethrough"
        @click="toggleStrike"
      >
        <s>S</s>
      </button>
      <button
        v-if="has('code')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('code') }"
        title="Inline Code"
        @click="toggleCode"
      >
        &lt;/&gt;
      </button>

      <span
        v-if="has('heading1') || has('heading2') || has('heading3')"
        class="pro-rich-editor__divider"
      />

      <!-- Headings -->
      <button
        v-if="has('heading1')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('heading', { level: 1 }) }"
        title="Heading 1"
        @click="setHeading(1)"
      >
        H1
      </button>
      <button
        v-if="has('heading2')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('heading', { level: 2 }) }"
        title="Heading 2"
        @click="setHeading(2)"
      >
        H2
      </button>
      <button
        v-if="has('heading3')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('heading', { level: 3 }) }"
        title="Heading 3"
        @click="setHeading(3)"
      >
        H3
      </button>

      <span
        v-if="has('bulletList') || has('orderedList') || has('taskList')"
        class="pro-rich-editor__divider"
      />

      <!-- Lists -->
      <button
        v-if="has('bulletList')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('bulletList') }"
        title="Bullet List"
        @click="toggleBulletList"
      >
        <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
          <circle cx="2.5" cy="4" r="1.5" />
          <rect x="6" y="3" width="9" height="2" rx="0.5" />
          <circle cx="2.5" cy="8" r="1.5" />
          <rect x="6" y="7" width="9" height="2" rx="0.5" />
          <circle cx="2.5" cy="12" r="1.5" />
          <rect x="6" y="11" width="9" height="2" rx="0.5" />
        </svg>
      </button>
      <button
        v-if="has('orderedList')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('orderedList') }"
        title="Ordered List"
        @click="toggleOrderedList"
      >
        <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
          <text x="1" y="5.5" font-size="5" font-weight="600">1</text>
          <rect x="6" y="3" width="9" height="2" rx="0.5" />
          <text x="1" y="9.5" font-size="5" font-weight="600">2</text>
          <rect x="6" y="7" width="9" height="2" rx="0.5" />
          <text x="1" y="13.5" font-size="5" font-weight="600">3</text>
          <rect x="6" y="11" width="9" height="2" rx="0.5" />
        </svg>
      </button>
      <button
        v-if="has('taskList')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('taskList') }"
        title="Task List"
        @click="toggleTaskList"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="1" y="2" width="5" height="5" rx="1" />
          <path d="M2.5 4.5l1.2 1.2 2.3-2.4" />
          <rect x="1" y="9" width="5" height="5" rx="1" />
          <line x1="8" y1="4.5" x2="15" y2="4.5" />
          <line x1="8" y1="11.5" x2="15" y2="11.5" />
        </svg>
      </button>

      <span
        v-if="has('blockquote') || has('codeBlock') || has('horizontalRule')"
        class="pro-rich-editor__divider"
      />

      <!-- Blocks -->
      <button
        v-if="has('blockquote')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('blockquote') }"
        title="Blockquote"
        @click="toggleBlockquote"
      >
        <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
          <path d="M3 3h2.5L4 7h2v6H2V7l1-4zm7 0h2.5L11 7h2v6H9V7l1-4z" />
        </svg>
      </button>
      <button
        v-if="has('codeBlock')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('codeBlock') }"
        title="Code Block"
        @click="toggleCodeBlock"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 3L1 8l4 5" />
          <path d="M11 3l4 5-4 5" />
          <line x1="9" y1="2" x2="7" y2="14" />
        </svg>
      </button>
      <button
        v-if="has('horizontalRule')"
        class="pro-rich-editor__btn"
        title="Horizontal Rule"
        @click="insertHorizontalRule"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <line x1="1" y1="8" x2="15" y2="8" />
        </svg>
      </button>

      <span v-if="has('link') || has('image') || has('table')" class="pro-rich-editor__divider" />

      <!-- Insert -->
      <button
        v-if="has('link')"
        class="pro-rich-editor__btn"
        :class="{ 'is-active': isActive('link') }"
        title="Insert Link"
        @click="insertLink"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" />
          <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" />
        </svg>
      </button>
      <button
        v-if="has('image')"
        class="pro-rich-editor__btn"
        title="Insert Image"
        @click="insertImage"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="1" y="2" width="14" height="12" rx="2" />
          <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <path d="M1 11l3.5-3.5 2.5 2.5 3-3L15 12" />
        </svg>
      </button>
      <button
        v-if="has('table')"
        class="pro-rich-editor__btn"
        title="Insert Table"
        @click="insertTable"
      >
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="1" y="2" width="14" height="12" rx="1.5" />
          <line x1="1" y1="6" x2="15" y2="6" />
          <line x1="1" y1="10" x2="15" y2="10" />
          <line x1="6" y1="2" x2="6" y2="14" />
          <line x1="11" y1="2" x2="11" y2="14" />
        </svg>
      </button>

      <div style="flex: 1" />

      <!-- Undo/Redo -->
      <button v-if="has('undo')" class="pro-rich-editor__btn" title="Undo" @click="handleUndo">
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 7h7a4 4 0 110 8H8" />
          <path d="M6 4L3 7l3 3" />
        </svg>
      </button>
      <button v-if="has('redo')" class="pro-rich-editor__btn" title="Redo" @click="handleRedo">
        <svg
          viewBox="0 0 16 16"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M13 7H6a4 4 0 100 8h2" />
          <path d="M10 4l3 3-3 3" />
        </svg>
      </button>
    </div>

    <!-- Editor content -->
    <div class="pro-rich-editor__content" :style="contentStyle">
      <EditorContent v-if="editor" :editor="editor" />
    </div>

    <!-- Footer -->
    <div v-if="showWordCount" class="pro-rich-editor__footer">
      <span class="pro-rich-editor__count">{{ wordCount }} words</span>
      <span class="pro-rich-editor__count">{{ charCount }} characters</span>
      <span
        v-if="maxLength > 0"
        class="pro-rich-editor__count"
        :class="{ 'pro-rich-editor__count--limit': charCount >= maxLength }"
      >
        {{ charCount }} / {{ maxLength }}
      </span>
    </div>
  </div>
</template>

<style>
.pro-rich-editor {
  border: 1px solid var(--pro-border-default, #e5e5e5);
  border-radius: var(--pro-radius-md, 8px);
  overflow: hidden;
  background: var(--pro-bg-elevated, #fff);
}

.pro-rich-editor:focus-within {
  border-color: var(--pro-color-primary, #409eff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.pro-rich-editor--readonly {
  background: var(--pro-bg-sunken, #fafafa);
}

/* ─── Toolbar ─────────────────────────────────────────────────────── */
.pro-rich-editor__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  background: var(--pro-bg-sunken, #f8f8f8);
  border-bottom: 1px solid var(--pro-border-light, #ebebeb);
}

.pro-rich-editor__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--pro-text-secondary, #6b7280);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  user-select: none;
}

.pro-rich-editor__btn:hover {
  background: var(--pro-bg-elevated, #e5e5e5);
  color: var(--pro-text-primary, #1f2937);
}

.pro-rich-editor__btn.is-active {
  background: var(--pro-color-primary-light, #ecf5ff);
  color: var(--pro-color-primary, #409eff);
}

.pro-rich-editor__divider {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: var(--pro-border-light, #e5e5e5);
  margin: 0 4px;
}

/* ─── Content area ────────────────────────────────────────────────── */
.pro-rich-editor__content {
  overflow-y: auto;
  padding: 0;
}

.pro-rich-editor__content .tiptap {
  outline: none;
  padding: 16px 20px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--pro-text-primary, #1f2937);
}

.pro-rich-editor__content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--pro-text-quaternary, #c0c0c0);
  pointer-events: none;
  height: 0;
}

/* Headings */
.pro-rich-editor__content .tiptap h1 {
  font-size: 1.875em;
  font-weight: 700;
  margin: 1em 0 0.5em;
  line-height: 1.3;
}

.pro-rich-editor__content .tiptap h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
  line-height: 1.35;
}

.pro-rich-editor__content .tiptap h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
  line-height: 1.4;
}

/* Lists */
.pro-rich-editor__content .tiptap ul,
.pro-rich-editor__content .tiptap ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.pro-rich-editor__content .tiptap li {
  margin: 0.25em 0;
}

/* Task list */
.pro-rich-editor__content .tiptap ul[data-type='taskList'] {
  list-style: none;
  padding-left: 0;
}

.pro-rich-editor__content .tiptap ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.pro-rich-editor__content .tiptap ul[data-type='taskList'] li label {
  margin-top: 3px;
}

/* Blockquote */
.pro-rich-editor__content .tiptap blockquote {
  border-left: 3px solid var(--pro-color-primary, #409eff);
  padding-left: 16px;
  margin: 0.8em 0;
  color: var(--pro-text-secondary, #6b7280);
}

/* Code */
.pro-rich-editor__content .tiptap code {
  background: var(--pro-bg-sunken, #f5f5f5);
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 0.9em;
  color: var(--pro-color-primary, #409eff);
}

.pro-rich-editor__content .tiptap pre {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  padding: 14px 18px;
  margin: 0.8em 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.pro-rich-editor__content .tiptap pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* Horizontal rule */
.pro-rich-editor__content .tiptap hr {
  border: none;
  border-top: 1px solid var(--pro-border-light, #e5e5e5);
  margin: 1.5em 0;
}

/* Link */
.pro-rich-editor__content .tiptap a {
  color: var(--pro-color-primary, #409eff);
  text-decoration: underline;
  cursor: pointer;
}

/* Image */
.pro-rich-editor__content .tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

/* Table */
.pro-rich-editor__content .tiptap table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
}

.pro-rich-editor__content .tiptap th,
.pro-rich-editor__content .tiptap td {
  border: 1px solid var(--pro-border-default, #e5e5e5);
  padding: 8px 12px;
  text-align: left;
  min-width: 80px;
}

.pro-rich-editor__content .tiptap th {
  background: var(--pro-bg-sunken, #f8f8f8);
  font-weight: 600;
}

/* Highlight */
.pro-rich-editor__content .tiptap mark {
  background: #fef08a;
  padding: 1px 2px;
  border-radius: 2px;
}

/* ─── Footer ──────────────────────────────────────────────────────── */
.pro-rich-editor__footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 12px;
  border-top: 1px solid var(--pro-border-light, #ebebeb);
  background: var(--pro-bg-sunken, #f8f8f8);
  min-height: 28px;
}

.pro-rich-editor__count {
  font-size: 11px;
  color: var(--pro-text-tertiary, #999);
  user-select: none;
}

.pro-rich-editor__count--limit {
  color: #ef4444;
  font-weight: 600;
}
</style>
