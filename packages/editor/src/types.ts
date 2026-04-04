import type { Editor } from '@tiptap/vue-3'

/** Toolbar action identifiers */
export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'link'
  | 'image'
  | 'table'
  | 'textAlign'
  | 'color'
  | 'highlight'
  | 'undo'
  | 'redo'

/** Props for the RichEditor component */
export interface RichEditorProps {
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
  /** Toolbar actions to display. Defaults to all. */
  toolbar?: ToolbarAction[]
}

/** Return type for useRichEditor composable */
export interface UseRichEditorReturn {
  /** The TipTap Editor instance */
  editor: Editor | undefined
  /** Whether the editor is focused */
  isFocused: boolean
  /** Whether the content is empty */
  isEmpty: boolean
  /** Current word count */
  wordCount: number
  /** Current character count */
  characterCount: number
  /** Get HTML content */
  getHTML: () => string
  /** Get plain text content */
  getText: () => string
  /** Get JSON content */
  getJSON: () => Record<string, unknown>
  /** Set HTML content */
  setContent: (html: string) => void
  /** Clear all content */
  clearContent: () => void
  /** Focus the editor */
  focus: () => void
  /** Blur the editor */
  blur: () => void
}
