import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export type StickyNoteModel = {
  id: string
  content: string
  x: number
  y: number
}

const storageKey = 'planner:stickyNotes:v1'

const readLocal = (): StickyNoteModel[] => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((n) => {
        if (!n || typeof n !== 'object') return null
        const obj = n as Record<string, unknown>
        const id = typeof obj.id === 'string' ? obj.id : null
        const content = typeof obj.content === 'string' ? obj.content : ''
        const x = typeof obj.x === 'number' ? obj.x : 80
        const y = typeof obj.y === 'number' ? obj.y : 80
        if (!id) return null
        return { id, content, x, y }
      })
      .filter((n): n is StickyNoteModel => Boolean(n))
  } catch {
    return []
  }
}

const writeLocal = (notes: StickyNoteModel[]) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(notes))
  } catch {
    return
  }
}

export const useStickyNotes = (userId: string | null) => {
  const [notes, setNotes] = useState<StickyNoteModel[]>(() => {
    if (typeof window === 'undefined') return []
    return readLocal()
  })
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const pendingUpsertsRef = useRef<Record<string, number>>({})
  const enabled = useMemo(() => supabaseConfigured && Boolean(userId), [userId])
  const ready = useMemo(() => (!enabled ? true : loadedUserId === userId), [enabled, loadedUserId, userId])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('id, content, x, y')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (error) {
        setLoadedUserId(userId)
        return
      }

      const next =
        data?.map((row) => ({
          id: row.id as string,
          content: (row.content as string) ?? '',
          x: Number(row.x ?? 80),
          y: Number(row.y ?? 80),
        })) ?? []

      setNotes(next)
      setLoadedUserId(userId)
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, userId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    writeLocal(notes)
  }, [notes])

  const createNote = async () => {
    const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const note: StickyNoteModel = { id, content: '', x: 80, y: 90 }
    setNotes((prev) => [note, ...prev])

    if (!enabled) return id

    await supabase.from('sticky_notes').insert({
      id,
      user_id: userId,
      content: note.content,
      x: note.x,
      y: note.y,
    })

    return id
  }

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))

    if (!enabled) return

    await supabase.from('sticky_notes').delete().eq('id', id).eq('user_id', userId)
  }

  const upsertNote = (patch: StickyNoteModel) => {
    setNotes((prev) => prev.map((n) => (n.id === patch.id ? patch : n)))

    if (!enabled) return

    const timers = pendingUpsertsRef.current
    if (timers[patch.id]) window.clearTimeout(timers[patch.id])
    timers[patch.id] = window.setTimeout(async () => {
      delete timers[patch.id]
      await supabase.from('sticky_notes').upsert({
        id: patch.id,
        user_id: userId,
        content: patch.content,
        x: patch.x,
        y: patch.y,
      })
    }, 350)
  }

  return { notes, ready, createNote, deleteNote, upsertNote }
}
