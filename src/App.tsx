import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { addDays, addWeeks, format, startOfWeek, subDays, subWeeks } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DayView } from './components/diary/DayView'
import { PageFlip } from './components/layout/PageFlip'
import { Auth } from './components/layout/Auth'
import { CalendarModal } from './components/calendar/CalendarModal'
import { SettingsModal, type PlannerLayoutPreset } from './components/layout/SettingsModal'
import { WeeklyView } from './components/weekly/WeeklyView.tsx'
import { useAuth } from './hooks/useAuth'
import { supabaseConfigured } from './lib/supabase'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun } from 'lucide-react'

type PlannerTheme = 'light' | 'dark'

type WeekMeta = {
  focusLines: [string, string]
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

  try {
    if (typeof window === 'undefined') return defaults
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<typeof defaults>

    const weekMetaByWeek =
      parsed.weekMetaByWeek && typeof parsed.weekMetaByWeek === 'object' ? (parsed.weekMetaByWeek as WeekMetaByWeek) : defaults.weekMetaByWeek

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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [linesByDate, setLinesByDate] = useState<Record<string, string[]>>(persistedAtLoad.linesByDate)
  const [focusByDate, setFocusByDate] = useState<Record<string, string>>(persistedAtLoad.focusByDate)
  const [weekMetaByWeek, setWeekMetaByWeek] = useState<WeekMetaByWeek>(persistedAtLoad.weekMetaByWeek)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [layoutPreset, setLayoutPreset] = useState<PlannerLayoutPreset>(persistedAtLoad.layoutPreset)
  const [theme, setTheme] = useState<PlannerTheme>(() => {
    if (typeof window === 'undefined') return persistedAtLoad.theme
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    return persistedAtLoad.theme ?? (prefersDark ? 'dark' : 'light')
  })

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate])
  const currentISODate = useMemo(() => format(currentDate, 'yyyy-MM-dd'), [currentDate])
  const emptyLines = useMemo(() => new Array(20).fill(''), [])
  const currentLines = useMemo(() => linesByDate[currentISODate] ?? emptyLines, [currentISODate, emptyLines, linesByDate])
  const weekKey = useMemo(() => format(weekStart, 'yyyy-MM-dd'), [weekStart])
  const weekMeta = useMemo<WeekMeta>(() => {
    return (
      weekMetaByWeek[weekKey] ?? {
        focusLines: ['', ''],
        summaryLines: ['', '', ''],
      }
    )
  }, [weekKey, weekMetaByWeek])

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
      className="min-h-screen selection:bg-highlight-yellow text-base"
      style={layoutVars}
    >
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-8 pb-24">
        <PageFlip
          direction={direction}
          pageKey={`${view}-${view === 'week' ? weekStart.toISOString() : currentDate.toISOString()}`}
        >
          <div className="book-frame">
            <div className="book-pages" data-view={view}>
              <div className="planner-toolbar">
                <div className="planner-toolbar__left">
                  {view === 'day' && (
                    <button
                      type="button"
                      onClick={() => {
                        setDirection(-1)
                        setView('week')
                      }}
                      className="planner-toolbar__btn"
                      aria-label="Назад к неделе"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(true)}
                    className="planner-toolbar__btn"
                    aria-label="Календарь"
                  >
                    <CalendarDays size={18} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCalendarOpen(true)}
                  className="planner-toolbar__title"
                >
                  {format(view === 'week' ? weekStart : currentDate, 'LLLL yyyy', { locale: ru })}
                </button>

                <div className="planner-toolbar__right">
                  <button type="button" onClick={goPrev} className="planner-toolbar__btn" aria-label="Предыдущая">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={goNext} className="planner-toolbar__btn" aria-label="Следующая">
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                    className="planner-toolbar__btn"
                    aria-label="Тема"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="planner-toolbar__btn"
                    aria-label="Настройки"
                  >
                    <Settings size={18} />
                  </button>
                  {supabaseConfigured && (
                    <button type="button" onClick={signOut} className="planner-toolbar__btn" aria-label="Выйти">
                      <LogOut size={18} />
                    </button>
                  )}
                </div>
              </div>

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
                <DayView
                  key={currentISODate}
                  date={currentDate}
                  lines={currentLines}
                  onLinesChange={(lines) => setLinesByDate((prev) => ({ ...prev, [currentISODate]: lines }))}
                />
              )}
            </div>
          </div>
        </PageFlip>
      </main>

      <button
        onClick={() => {
          const today = new Date()
          setDirection(today > currentDate ? 1 : -1)
          setCurrentDate(today)
          setView('week')
        }}
        className="planner-fab"
      >
        сегодня
      </button>

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
    </div>
  )
}

export default App
