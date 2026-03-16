import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { InlineEditor } from '../editor/InlineEditor.tsx'
import { motion } from 'framer-motion'

interface DayViewProps {
  date: Date
  lines: string[]
  onLinesChange: (lines: string[]) => void
  notes: string[]
  onNotesChange: (notes: string[]) => void
}

export const DayView = ({ date, lines, onLinesChange, notes, onNotesChange }: DayViewProps) => {
  const [activeNoteIndex, setActiveNoteIndex] = useState(0)

  const handleLineChange = (index: number, content: string) => {
    const newLines = [...lines]
    newLines[index] = content
    onLinesChange(newLines)
  }

  const safeNotes = notes.length > 0 ? notes : ['']
  const activeNote = safeNotes[Math.min(activeNoteIndex, safeNotes.length - 1)] ?? ''

  return (
    <div className="paper-page p-8 max-w-2xl mx-auto my-8">
      {/* Header with Date and Sticky Note */}
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif lowercase tracking-tight">
            {format(date, 'EEEE', { locale: ru })}
          </h1>
          <div className="text-ink/40 font-serif italic text-lg">
            {format(date, 'd MMMM yyyy', { locale: ru })}
          </div>
        </div>

        <motion.div 
          initial={{ rotate: -2, scale: 0.9, opacity: 0 }}
          animate={{ rotate: -1, scale: 1, opacity: 1 }}
          className="sticky-note w-48 min-h-[120px]"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-ink/20 text-xs uppercase tracking-widest font-sans">Notes</div>
            <button
              type="button"
              onClick={() => {
                const next = [...safeNotes, '']
                onNotesChange(next)
                setActiveNoteIndex(next.length - 1)
              }}
              className="text-ink/30 hover:text-ink/60 font-sans text-xs"
            >
              +
            </button>
          </div>

          <div className="flex gap-1 mb-2">
            {safeNotes.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveNoteIndex(idx)}
                className={`h-2 w-2 rounded-full ${idx === activeNoteIndex ? 'bg-ink/40' : 'bg-ink/15'}`}
              />
            ))}
          </div>

          <textarea
            value={activeNote}
            onChange={(e) => {
              const next = [...safeNotes]
              next[Math.min(activeNoteIndex, next.length - 1)] = e.target.value
              onNotesChange(next)
            }}
            className="w-full bg-transparent border-none focus:ring-0 resize-none font-handwritten text-lg leading-tight placeholder-ink/20 outline-none"
            placeholder="заметка…"
            rows={4}
          />
        </motion.div>
      </div>

      {/* Interactive Lines */}
      <div className="space-y-0">
        {lines.map((content, idx) => (
          <div key={idx} className="paper-line group relative">
            <span className="absolute left-0 -ml-8 text-[10px] text-ink/20 font-sans tabular-nums mt-1">
              {(idx + 7).toString().padStart(2, '0')}:00
            </span>
            <InlineEditor
              content={content}
              onChange={(newContent) => handleLineChange(idx, newContent)}
              className="flex-1 h-full"
            />
          </div>
        ))}
      </div>
      
      {/* Footer Branding */}
      <div className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-ink/20 font-sans">
        Handcrafted Digital Journal
      </div>
    </div>
  )
}
