import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { addDays, addWeeks, format, startOfWeek, subDays, subWeeks } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DayView } from './components/diary/DayView'
import { Auth } from './components/layout/Auth'
import { CalendarModal } from './components/calendar/CalendarModal'
import { SettingsModal, type PlannerLayoutPreset } from './components/layout/SettingsModal'
import { WeeklyView } from './components/weekly/WeeklyView.tsx'
import { StickyNotesLayer } from './components/sticky/StickyNotesLayer'
import { useAuth } from './hooks/useAuth'
import { useStickyNotes } from './hooks/useStickyNotes'
import { supabase, supabaseConfigured } from './lib/supabase'
import { Calendar, List, StickyNote, ChevronLeft, ChevronRight, Settings, LogOut, Plus } from 'lucide-react'

type PlannerTheme = 'light' | 'dark'

type WeekMeta = {
  focusLine: string
  summaryLines: [string, string, string]
}

type WeekMetaByWeek = Record<string, WeekMeta>

const storageKey = 'planner:state:v1'

const readPersisted = (): {
  linesByDate: Record<string, string[]>
  focusByDate: Record<string, string>
  layoutPreset: PlannerLayoutPreset
  theme: PlannerTheme
  weekMetaByWeek: WeekMetaByWeek
} => {
  const defaults = {
    linesByDate: {} as Record<string, string[]>,
    focusByDate: {} as Record<string, string>,
    layoutPreset: 'normal' as PlannerLayoutPreset,
    theme: 'light' as PlannerTheme,
    weekMetaByWeek: {} as WeekMetaByWeek,
  }

  const normalizeWeekMetaByWeek = (input: unknown): WeekMetaByWeek => {
    if (!input || typeof input !== 'object') return {}
    const obj = input as Record<string, unknown>
    const out: WeekMetaByWeek = {}
    for (const [key, value] of Object.entries(obj)) {
      if (!value || typeof value !== 'object') continue
      const v = value as Record<string, unknown>

      const focusLine =
        typeof v.focusLine === 'string'
          ? v.focusLine
          : Array.isArray(v.focusLines) && typeof v.focusLines[0] === 'string'
            ? (v.focusLines[0] as string)
            : ''

      const summaryLinesRaw = v.summaryLines
      const summaryLines: [string, string, string] =
        Array.isArray(summaryLinesRaw) && summaryLinesRaw.length >= 3
          ? [
              typeof summaryLinesRaw[0] === 'string' ? (summaryLinesRaw[0] as string) : '',
              typeof summaryLinesRaw[1] === 'string' ? (summaryLinesRaw[1] as string) : '',
              typeof summaryLinesRaw[2] === 'string' ? (summaryLinesRaw[2] as string) : '',
            ]
          : ['', '', '']

      out[key] = { focusLine, summaryLines }
    }
    return out
  }

  try {
    if (typeof window === 'undefined') return defaults
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<typeof defaults>

    const weekMetaByWeek = normalizeWeekMetaByWeek(parsed.weekMetaByWeek)

    return {
      linesByDate: parsed.linesByDate && typeof parsed.linesByDate === 'object' ? parsed.linesByDate : defaults.linesByDate,
      focusByDate: parsed.focusByDate && typeof parsed.focusByDate === 'object' ? parsed.focusByDate : defaults.focusByDate,
      layoutPreset:
        parsed.layoutPreset === 'compact' || parsed.layoutPreset === 'normal' || parsed.layoutPreset === 'comfort'
          ? parsed.layoutPreset
          : defaults.layoutPreset,
      theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : defaults.theme,
      weekMetaByWeek,
    }
  } catch {
    return defaults
  }
}

const persistedAtLoad = readPersisted()

function App() {
  const { user, loading, signOut } = useAuth()
  const userId = user?.id ?? null
  const [currentDate, setCurrentDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [linesByDate, setLinesByDate] = useState<Record<string, string[]>>(persistedAtLoad.linesByDate)
  const [focusByDate, setFocusByDate] = useState<Record<string, string>>(persistedAtLoad.focusByDate)
  const [weekMetaByWeek, setWeekMetaByWeek] = useState<WeekMetaByWeek>(persistedAtLoad.weekMetaByWeek)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [layoutPreset, setLayoutPreset] = useState<PlannerLayoutPreset>(persistedAtLoad.layoutPreset)
  const [theme, setTheme] = useState<PlannerTheme>(persistedAtLoad.theme)

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate])
  const currentISODate = useMemo(() => format(currentDate, 'yyyy-MM-dd'), [currentDate])
  const emptyLines = useMemo(() => new Array(20).fill(''), [])
  const currentLines = useMemo(() => linesByDate[currentISODate] ?? emptyLines, [currentISODate, emptyLines, linesByDate])
  const weekKey = useMemo(() => format(weekStart, 'yyyy-MM-dd'), [weekStart])
  const weekMeta = useMemo<WeekMeta>(() => {
    return (
      weekMetaByWeek[weekKey] ?? {
        focusLine: '',
        summaryLines: ['', '', ''],
      }
    )
  }, [weekKey, weekMetaByWeek])

  const { notes, createNote, duplicateNote, deleteNote, upsertNote } = useStickyNotes(userId)
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false)
  const [stickyMenuPos, setStickyMenuPos] = useState<{ top: number; left: number } | null>(null)
  const stickyBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!stickyMenuOpen) return
    const btn = stickyBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setStickyMenuPos({ top: rect.bottom + 8, left: rect.left })
  }, [stickyMenuOpen])

  useEffect(() => {
    if (!supabaseConfigured || !userId) return

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('planner_state')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle()

      if (cancelled) return

      if (error || !data?.data) {
        setLoadedUserId(userId)
        return
      }

      const d = data.data as Partial<{
        linesByDate: Record<string, string[]>
        focusByDate: Record<string, string>
        weekMetaByWeek: unknown
        layoutPreset: PlannerLayoutPreset
        theme: PlannerTheme
      }>

      if (d.linesByDate && typeof d.linesByDate === 'object') setLinesByDate(d.linesByDate)
      if (d.focusByDate && typeof d.focusByDate === 'object') setFocusByDate(d.focusByDate)
      if (d.weekMetaByWeek && typeof d.weekMetaByWeek === 'object') {
        setWeekMetaByWeek(() => {
          const obj = d.weekMetaByWeek as Record<string, unknown>
          const out: WeekMetaByWeek = {}
          for (const [key, value] of Object.entries(obj)) {
            if (!value || typeof value !== 'object') continue
            const v = value as Record<string, unknown>
            const focusLine =
              typeof v.focusLine === 'string'
                ? v.focusLine
                : Array.isArray(v.focusLines) && typeof v.focusLines[0] === 'string'
                  ? (v.focusLines[0] as string)
                  : ''
            const summaryLinesRaw = v.summaryLines
            const summaryLines: [string, string, string] =
              Array.isArray(summaryLinesRaw) && summaryLinesRaw.length >= 3
                ? [
                    typeof summaryLinesRaw[0] === 'string' ? (summaryLinesRaw[0] as string) : '',
                    typeof summaryLinesRaw[1] === 'string' ? (summaryLinesRaw[1] as string) : '',
                    typeof summaryLinesRaw[2] === 'string' ? (summaryLinesRaw[2] as string) : '',
                  ]
                : ['', '', '']
            out[key] = { focusLine, summaryLines }
          }
          return out
        })
      }
      if (d.layoutPreset === 'compact' || d.layoutPreset === 'normal' || d.layoutPreset === 'comfort') setLayoutPreset(d.layoutPreset)
      if (d.theme === 'dark' || d.theme === 'light') setTheme(d.theme)

      setLoadedUserId(userId)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            linesByDate,
            focusByDate,
            layoutPreset,
            theme,
            weekMetaByWeek,
          })
        )
      } catch {
        return
      }
    }, 250)

    return () => window.clearTimeout(t)
  }, [focusByDate, layoutPreset, linesByDate, theme, weekMetaByWeek])

  useEffect(() => {
    if (!supabaseConfigured || !userId) return
    if (loadedUserId !== userId) return
    const t = window.setTimeout(async () => {
      try {
        await supabase.from('planner_state').upsert({
          user_id: userId,
          data: {
            linesByDate,
            focusByDate,
            layoutPreset,
            theme,
            weekMetaByWeek,
          },
          updated_at: new Date().toISOString(),
        })
      } catch {
        return
      }
    }, 650)

    return () => window.clearTimeout(t)
  }, [focusByDate, layoutPreset, linesByDate, loadedUserId, theme, userId, weekMetaByWeek])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse font-serif italic text-2xl text-ink/60">loading...</div>
      </div>
    )
  }

  if (supabaseConfigured && !user) {
    return <Auth />
  }

  const layoutVars: CSSProperties & Record<string, string> = {
    '--week-line-font-size':
      layoutPreset === 'compact' ? '12px' : layoutPreset === 'comfort' ? '14px' : '13px',
  }

  const goPrev = () => {
    if (view === 'week') {
      setDirection(-1)
      setCurrentDate((d) => subWeeks(d, 1))
      return
    }
    setDirection(-1)
    setCurrentDate((d) => subDays(d, 1))
  }

  const goNext = () => {
    if (view === 'week') {
      setDirection(1)
      setCurrentDate((d) => addWeeks(d, 1))
      return
    }
    setDirection(1)
    setCurrentDate((d) => addDays(d, 1))
  }

  return (
    <div
      data-theme={theme}
      className="min-h-screen selection:bg-highlight-yellow text-base bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-8"
      style={layoutVars}
    >
      <div className="relative w-full max-w-[1100px] mx-auto">
        <div
          className="relative bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: `
              0 0 0 8px #6A1B9A,
              0 10px 40px rgba(106, 27, 154, 0.15),
              0 20px 60px rgba(106, 27, 154, 0.08)
            `,
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Календарь"
              >
                <Calendar size={18} className="text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection(view === 'week' ? 1 : -1)
                  setView((v) => (v === 'week' ? 'day' : 'week'))
                }}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Переключить вид"
              >
                <List size={18} className="text-gray-600" />
              </button>
              <button
                ref={stickyBtnRef}
                type="button"
                onClick={() => setStickyMenuOpen(true)}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Стикеры"
              >
                <StickyNote size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goPrev}
                className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Предыдущая"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>

              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className="bg-gradient-to-br from-[#F4C542] to-[#F0B429] px-5 py-2 rounded-full shadow-sm"
                aria-label="Выбор месяца"
              >
                <span className="text-[13px] tracking-wide font-medium">
                  {format(view === 'week' ? weekStart : currentDate, 'LLLL yyyy', { locale: ru })}
                </span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Следующая"
              >
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Настройки"
              >
                <Settings size={18} className="text-gray-600" />
              </button>
              {supabaseConfigured && (
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                  aria-label="Выйти"
                >
                  <LogOut size={18} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            {view === 'week' ? (
              <WeeklyView
                date={currentDate}
                direction={direction}
                linesByDate={linesByDate}
                focusByDate={focusByDate}
                weekKey={weekKey}
                weekMeta={weekMeta}
                onWeekMetaChange={(next) => setWeekMetaByWeek((prev) => ({ ...prev, [weekKey]: next }))}
                onLinesChange={(isoDate, lines) => setLinesByDate((prev) => ({ ...prev, [isoDate]: lines }))}
                onFocusChange={(isoDate, focus) => setFocusByDate((prev) => ({ ...prev, [isoDate]: focus }))}
                onOpenDay={(d: Date, dir: number) => {
                  setDirection(dir === 0 ? 1 : dir)
                  setCurrentDate(d)
                  setView('day')
                }}
              />
            ) : (
              <div className="p-6">
                <DayView
                  key={currentISODate}
                  date={currentDate}
                  focus={focusByDate[currentISODate] ?? ''}
                  onFocusChange={(focus) => setFocusByDate((prev) => ({ ...prev, [currentISODate]: focus }))}
                  lines={currentLines}
                  onLinesChange={(lines) => setLinesByDate((prev) => ({ ...prev, [currentISODate]: lines }))}
                />
              </div>
            )}

            <StickyNotesLayer
              notes={notes}
              onChange={upsertNote}
              onDelete={deleteNote}
              onDuplicate={(id) => {
                void duplicateNote(id)
              }}
            />
          </div>

          <div className="absolute left-1/2 top-16 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200/40 to-transparent pointer-events-none" />

          <div className="absolute left-1/2 -translate-x-1/2 top-20 bottom-20 pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gray-200/30"
                style={{
                  top: `${i * 15}%`,
                  left: '-4px',
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const today = new Date()
            setDirection(today > currentDate ? 1 : -1)
            setCurrentDate(today)
            setView('week')
          }}
          className="absolute -bottom-3 -right-3 bg-gradient-to-br from-[#F4C542] to-[#F0B429] text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-medium z-20"
        >
          сегодня
        </button>
      </div>

      <CalendarModal
        open={calendarOpen}
        value={currentDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={(d) => {
          setCurrentDate(d)
          setView('week')
        }}
      />

      <SettingsModal
        open={settingsOpen}
        value={layoutPreset}
        onChange={setLayoutPreset}
        onClose={() => setSettingsOpen(false)}
      />

      {stickyMenuOpen && stickyMenuPos && (
        <div
          className="fixed inset-0 z-[120]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setStickyMenuOpen(false)
          }}
        >
          <div
            className="absolute bg-white rounded-2xl border border-gray-200/70 shadow-xl overflow-hidden"
            style={{ top: stickyMenuPos.top, left: stickyMenuPos.left, width: 220 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Стикеры</div>
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500"
                onClick={() => setStickyMenuOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>
            <button
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                void createNote()
                setStickyMenuOpen(false)
              }}
            >
              <Plus size={16} className="text-gray-600" />
              <span className="text-sm text-gray-700">Новый стикер</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
