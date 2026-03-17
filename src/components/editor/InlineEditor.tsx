import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { memo, useEffect, useRef, useState } from 'react'
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
  const latestOnChangeRef = useRef(onChange)
  useEffect(() => {
    latestOnChangeRef.current = onChange
  }, [onChange])

  const enableRich = mode === 'full' || showToolbar
  const [focused, setFocused] = useState(false)

  const editor = useEditor({
    extensions:
      !enableRich
        ? [StarterKit]
        : [StarterKit, Underline, Highlight.configure({ multicolor: true })],
    content,
    onUpdate: ({ editor }) => {
      latestHtmlRef.current = editor.getHTML()
      if (pendingUpdateRef.current) window.clearTimeout(pendingUpdateRef.current)
      pendingUpdateRef.current = window.setTimeout(() => {
        pendingUpdateRef.current = null
        latestOnChangeRef.current(latestHtmlRef.current)
      }, 70)
    },
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-w-0 w-full min-h-[18px] leading-[18px] cursor-text whitespace-pre-wrap break-words',
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
      latestOnChangeRef.current(editor.getHTML())
    }

    const handleFocus = () => setFocused(true)
    const handleBlur = () => setFocused(false)

    editor.on('focus', handleFocus)
    editor.on('blur', handleBlur)
    editor.on('blur', flush)
    return () => {
      editor.off('focus', handleFocus)
      editor.off('blur', handleBlur)
      editor.off('blur', flush)
    }
  }, [editor])

  return (
    <div
      className={className}
      data-nav-id={navId}
      data-nav-index={navIndex}
      onPointerDownCapture={(e) => {
        if (!editor) return
        if (e.button !== 0) return
        e.preventDefault()
        editor.chain().focus().run()
        requestAnimationFrame(() => {
          editor.commands.setTextSelection(1)
        })
      }}
    >
      {showToolbar && editor && focused && (
        <BubbleMenu 
          editor={editor} 
          options={{ placement: 'bottom' }}
          className="z-50"
        >
          <FloatingToolbar editor={editor} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
})
