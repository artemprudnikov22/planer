import { motion, useDragControls } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { StickyNoteModel } from '../../hooks/useStickyNotes'

const tiltForId = (id: string) => {
  void id
  return -2
}

const palette = ['#FFF9C4', '#E1F5DD', '#FFE4E9'] as const

const colorForId = (id: string) => {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

const curlForId = (id: string) => {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return (h & 1) === 0
}

export const StickyNotesLayer = ({
  notes,
  onChange,
  onDelete,
  onDuplicate,
}: {
  notes: StickyNoteModel[]
  onChange: (next: StickyNoteModel) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) => {
  const constraintsRef = useRef<HTMLDivElement | null>(null)
  const sorted = useMemo(() => notes.slice().sort((a, b) => (a.id < b.id ? 1 : -1)), [notes])
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openMenuForId) return
    const onDocPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (menuRef.current && target && menuRef.current.contains(target)) return
      setOpenMenuForId(null)
    }
    window.addEventListener('pointerdown', onDocPointerDown, true)
    return () => window.removeEventListener('pointerdown', onDocPointerDown, true)
  }, [openMenuForId])

  return (
    <div ref={constraintsRef} className="sticky-layer" aria-hidden={notes.length === 0}>
      {sorted.map((note) => (
        <StickyNoteItem
          key={note.id}
          note={note}
          constraintsRef={constraintsRef}
          openMenuForId={openMenuForId}
          setOpenMenuForId={setOpenMenuForId}
          menuRef={menuRef}
          onChange={onChange}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  )
}

const StickyNoteItem = ({
  note,
  constraintsRef,
  openMenuForId,
  setOpenMenuForId,
  menuRef,
  onChange,
  onDelete,
  onDuplicate,
}: {
  note: StickyNoteModel
  constraintsRef: RefObject<HTMLDivElement | null>
  openMenuForId: string | null
  setOpenMenuForId: Dispatch<SetStateAction<string | null>>
  menuRef: RefObject<HTMLDivElement | null>
  onChange: (next: StickyNoteModel) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) => {
  const dragControls = useDragControls()

  return (
    <motion.div
      className="absolute z-10 cursor-pointer group pointer-events-auto"
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={constraintsRef}
      initial={false}
      animate={{ x: note.x, y: note.y, rotate: tiltForId(note.id) }}
      onDragEnd={(_e, info) => {
        const host = constraintsRef.current
        if (!host) return
        const rect = host.getBoundingClientRect()
        const x = info.point.x - rect.left
        const y = info.point.y - rect.top
        onChange({ ...note, x, y })
      }}
    >
      <div
        className="relative w-[140px] h-[140px] p-3 transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        style={{
          backgroundColor: colorForId(note.id),
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement | null
          if (target?.closest?.('textarea,button,[data-sticky-menu]')) return
          dragControls.start(e)
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-sm"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.03) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0,0,0,0.03) 3px
            ), repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.02) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0,0,0,0.02) 3px
            )`,
          }}
        />

        {curlForId(note.id) && (
          <div
            className="absolute -bottom-1 -right-1 w-10 h-10 opacity-40 transition-opacity group-hover:opacity-60"
            style={{
              background: `linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.08) 100%)`,
              borderRadius: '0 0 100% 0',
            }}
          />
        )}

        <div className="relative h-full flex flex-col">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 transition-colors opacity-60 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpenMenuForId((prev) => (prev === note.id ? null : note.id))
              }}
              aria-label="Меню стикера"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {openMenuForId === note.id && (
            <div
              ref={menuRef}
              data-sticky-menu
              className="absolute right-2 top-9 bg-white rounded-xl shadow-lg border border-gray-200/70 overflow-hidden z-50 min-w-[140px]"
            >
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDuplicate(note.id)
                  setOpenMenuForId(null)
                }}
              >
                Скопировать
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(note.id)
                  setOpenMenuForId(null)
                }}
              >
                Удалить
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            <textarea
              value={note.content}
              onChange={(e) => onChange({ ...note, content: e.target.value })}
              placeholder="Стикер..."
              className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-700 text-sm leading-relaxed"
              style={{
                fontFamily: "'Caveat', 'Comic Sans MS', cursive",
                fontWeight: 400,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
