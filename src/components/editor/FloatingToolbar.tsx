import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Underline as UnderlineIcon, 
  Highlighter
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
    <div className="flex items-center gap-0.5 bg-paper/90 shadow-xl border border-ink/10 rounded-full p-1 backdrop-blur-md animate-in fade-in zoom-in duration-150">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <Bold size={14} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <Italic size={14} />
      </ToolbarButton>

      {hasUnderline && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>
      )}

      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
        <Strikethrough size={14} />
      </ToolbarButton>

      {hasHighlight && (
        <>
          <div className="w-[1px] h-4 bg-ink/10 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(236, 177, 68, 0.55)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(236, 177, 68, 0.55)' })}
            className="text-[#ECB144]"
          >
            <Highlighter size={14} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(100, 45, 144, 0.42)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(100, 45, 144, 0.42)' })}
            className="text-[#642D90]"
          >
            <Highlighter size={14} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(239, 68, 68, 0.42)' }).run()}
            active={editor.isActive('highlight', { color: 'rgba(239, 68, 68, 0.42)' })}
            className="text-[#EF4444]"
          >
            <Highlighter size={14} />
          </ToolbarButton>
        </>
      )}

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
    className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
      active 
        ? 'bg-ink text-paper' 
        : `hover:bg-ink/5 text-ink/60 hover:text-ink ${className || ''}`
    }`}
  >
    {children}
  </button>
)
