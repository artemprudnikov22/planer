import { useMemo, useState, type CSSProperties } from 'react'
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
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react'

function App() {
  const { user, loading, signOut } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [direction, setDirection] = useState(0)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [linesByDate, setLinesByDate] = useState<Record<string, string[]>>({})
  const [focusByDate, setFocusByDate] = useState<Record<string, string>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [layoutPreset, setLayoutPreset] = useState<PlannerLayoutPreset>('normal')

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate])
  const currentISODate = useMemo(() => format(currentDate, 'yyyy-MM-dd'), [currentDate])
  const emptyLines = useMemo(() => new Array(20).fill(''), [])
  const currentLines = useMemo(() => linesByDate[currentISODate] ?? emptyLines, [currentISODate, emptyLines, linesByDate])

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
      className="min-h-screen selection:bg-highlight-yellow text-base"
      style={layoutVars}
    >
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-8 pb-24">
        <PageFlip
          direction={direction}
          pageKey={`${view}-${view === 'week' ? weekStart.toISOString() : currentDate.toISOString()}`}
        >
          <div className="book-frame">
            <div className="book-pages">
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
        className="fixed bottom-6 right-6 bg-ink text-paper px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform font-serif italic text-base z-50"
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
