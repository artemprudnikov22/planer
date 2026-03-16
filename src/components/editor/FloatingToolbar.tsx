import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Underline as UnderlineIcon, 
  Highlighter, 
  Undo2,
  Redo2,
  Trash2
} from 'lucide-react'
import type { ReactNode } from 'react'

interface FloatingToolbarProps {
  editor: Editor | null
}

export const FloatingToolbar = ({ editor }: FloatingToolbarProps) => {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 bg-white shadow-2xl border border-ink/5 rounded-full p-1.5 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <Bold size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <Italic size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
      >
        <UnderlineIcon size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <div className="w-[1px] h-4 bg-ink/10 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(236, 177, 68, 0.35)' }).run()}
        active={editor.isActive('highlight', { color: 'rgba(236, 177, 68, 0.35)' })}
        className="text-[#ECB144]"
      >
        <Highlighter size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(100, 45, 144, 0.22)' }).run()}
        active={editor.isActive('highlight', { color: 'rgba(100, 45, 144, 0.22)' })}
        className="text-[#642D90]"
      >
        <Highlighter size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(219, 234, 254, 0.55)' }).run()}
        active={editor.isActive('highlight', { color: 'rgba(219, 234, 254, 0.55)' })}
        className="text-blue-600"
      >
        <Highlighter size={16} />
      </ToolbarButton>

      <div className="w-[1px] h-4 bg-ink/10 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        className="text-ink/50 hover:text-ink"
      >
        <Undo2 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        className="text-ink/50 hover:text-ink"
      >
        <Redo2 size={16} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="text-red-400 hover:text-red-600"
      >
        <Trash2 size={16} />
      </ToolbarButton>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  children: ReactNode
  className?: string
}

const ToolbarButton = ({ onClick, active, children, className }: ToolbarButtonProps) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
    className={`p-2 rounded-full transition-all flex items-center justify-center ${
      active 
        ? 'bg-ink text-white' 
        : `hover:bg-ink/5 text-ink/60 hover:text-ink ${className || ''}`
    }`}
  >
    {children}
  </button>
)
