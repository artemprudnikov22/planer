import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { useEffect } from 'react'
import { FloatingToolbar } from './FloatingToolbar'

interface InlineEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export const InlineEditor = ({ content, onChange, className }: InlineEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-w-[50px] w-full h-full flex items-center min-h-[40px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className={className}>
      {editor && (
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
}
