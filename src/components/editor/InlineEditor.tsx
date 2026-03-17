import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { memo, useEffect, useRef } from 'react'
import { FloatingToolbar } from './FloatingToolbar'

interface InlineEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  navId?: string
  navIndex?: number
  showToolbar?: boolean
  mode?: 'minimal' | 'full'
}

export const InlineEditor = memo(function InlineEditor({
  content,
  onChange,
  className,
  navId,
  navIndex,
  showToolbar = true,
  mode = 'full',
}: InlineEditorProps) {
  const pendingUpdateRef = useRef<number | null>(null)
  const latestHtmlRef = useRef(content)

  const editor = useEditor({
    extensions:
      mode === 'minimal'
        ? [StarterKit]
        : [StarterKit, Underline, Highlight.configure({ multicolor: true })],
    content,
    onUpdate: ({ editor }) => {
      latestHtmlRef.current = editor.getHTML()
      if (pendingUpdateRef.current) window.clearTimeout(pendingUpdateRef.current)
      pendingUpdateRef.current = window.setTimeout(() => {
        pendingUpdateRef.current = null
        onChange(latestHtmlRef.current)
      }, 70)
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-w-[50px] w-full h-full flex items-center min-h-[40px] cursor-text',
      },
      handleDOMEvents: {
        keydown: (_view, event) => {
          if (!navId || typeof navIndex !== 'number') return false
          if (event.defaultPrevented) return false
          if (!editor) return false

          const isPlain =
            !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey

          const selection = editor.state.selection

          const startPos = 1
          const endPos = editor.state.doc.content.size + 1
          const atStart = selection.empty && selection.from === startPos
          const atEnd = selection.empty && selection.to === endPos

          const focusIndex =
            event.key === 'ArrowDown' ? (atEnd ? navIndex + 1 : null) :
            event.key === 'ArrowUp' ? (atStart ? navIndex - 1 : null) :
            event.key === 'Enter' && isPlain ? navIndex + 1 :
            null

          if (focusIndex === null) return false
          if (focusIndex < 0) {
            event.preventDefault()
            return true
          }

          const nextHost = document.querySelector(
            `[data-nav-id="${navId}"][data-nav-index="${focusIndex}"]`
          ) as HTMLElement | null
          const nextEditable = nextHost?.querySelector?.('[contenteditable="true"]') as HTMLElement | null
          if (!nextEditable) {
            event.preventDefault()
            return true
          }

          event.preventDefault()
          nextEditable.focus()
          return true
        },
      },
    },
  })

  useEffect(() => {
    return () => {
      if (pendingUpdateRef.current) window.clearTimeout(pendingUpdateRef.current)
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (content === current) return
    if (editor.isFocused) return
    editor.commands.setContent(content)
  }, [content, editor])

  useEffect(() => {
    if (!editor) return
    const flush = () => {
      if (pendingUpdateRef.current) {
        window.clearTimeout(pendingUpdateRef.current)
        pendingUpdateRef.current = null
      }
      onChange(editor.getHTML())
    }

    editor.on('blur', flush)
    return () => {
      editor.off('blur', flush)
    }
  }, [editor, onChange])

  return (
    <div
      className={className}
      data-nav-id={navId}
      data-nav-index={navIndex}
      onPointerDown={() => {
        if (!editor) return
        editor.chain().focus().run()
      }}
    >
      {showToolbar && editor && (
        <BubbleMenu 
          editor={editor} 
          options={{ placement: 'bottom' }}
          shouldShow={({ editor }) => editor.isFocused}
          className="z-50"
        >
          <FloatingToolbar editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
})
