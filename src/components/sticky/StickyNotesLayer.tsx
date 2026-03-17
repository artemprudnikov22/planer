import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useMemo, useRef } from 'react'
import type { StickyNoteModel } from '../../hooks/useStickyNotes'

export const StickyNotesLayer = ({
  notes,
  onChange,
  onDelete,
}: {
  notes: StickyNoteModel[]
  onChange: (next: StickyNoteModel) => void
  onDelete: (id: string) => void
}) => {
  const constraintsRef = useRef<HTMLDivElement | null>(null)
  const sorted = useMemo(() => notes.slice().sort((a, b) => (a.id < b.id ? 1 : -1)), [notes])

  return (
    <div ref={constraintsRef} className="sticky-layer" aria-hidden={notes.length === 0}>
      {sorted.map((note) => (
        <motion.div
          key={note.id}
          className="sticky-note"
          drag
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={constraintsRef}
          initial={false}
          animate={{ x: note.x, y: note.y }}
          onDragEnd={(_e, info) => {
            onChange({ ...note, x: info.point.x, y: info.point.y })
          }}
        >
          <button type="button" className="sticky-note__close" onClick={() => onDelete(note.id)} aria-label="Remove note">
            <X size={14} />
          </button>
          <textarea
            value={note.content}
            onChange={(e) => onChange({ ...note, content: e.target.value })}
            placeholder="Note…"
            className="sticky-note__textarea"
          />
        </motion.div>
      ))}
    </div>
  )
}

