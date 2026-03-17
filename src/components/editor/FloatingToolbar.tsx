import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Underline as UnderlineIcon, 
  Highlighter, 
  Undo2,
  Redo2
} from 'lucide-react'
import type { ReactNode } from 'react'

interface FloatingToolbarProps {
  editor: Editor | null
}

export const FloatingToolbar = ({ editor }: FloatingToolbarProps) => {
  if (!editor) return null

  const hasUnderline = editor.extensionManager.extensions.some((ext) => ext.name === 'underline')
  const hasHighlight = editor.extensionManager.extensions.some((ext) => ext.name === 'highlight')

  return (
    <div className="flex items-center gap-1 bg-paper/90 shadow-xl border border-ink/10 rounded-full p-1.5 backdrop-blur-md animate-in fade-in zoom-in duration-200">
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

      {hasUnderline && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
      )}

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      {hasHighlight && (
        <>
          <div className="w-[1px] h-4 bg-ink/10 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(253, 224, 71, 0.85)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(253, 224, 71, 0.85)' })}
            className="text-[#FDE047]"
          >
            <Highlighter size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(34, 211, 238, 0.55)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(34, 211, 238, 0.55)' })}
            className="text-[#22D3EE]"
          >
            <Highlighter size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(167, 139, 250, 0.55)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(167, 139, 250, 0.55)' })}
            className="text-[#A78BFA]"
          >
            <Highlighter size={16} />
          </ToolbarButton>
        </>
      )}

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
        ? 'bg-ink text-paper' 
        : `hover:bg-ink/5 text-ink/60 hover:text-ink ${className || ''}`
    }`}
  >
    {children}
  </button>
)
