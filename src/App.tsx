import { useMemo, useState, type CSSProperties } from 'react'
import { addDays, addWeeks, format, getISOWeek, startOfWeek, subDays, subWeeks } from 'date-fns'
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
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [view, setView] = useState<'week' | 'day'>('week')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [linesByDate, setLinesByDate] = useState<Record<string, string[]>>({})
  const [focusByDate, setFocusByDate] = useState<Record<string, string>>({})
  const [notesByDate, setNotesByDate] = useState<Record<string, string[]>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [layoutPreset, setLayoutPreset] = useState<PlannerLayoutPreset>('normal')

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate])
  const weekNumber = useMemo(() => getISOWeek(weekStart), [weekStart])
  const currentISODate = useMemo(() => format(currentDate, 'yyyy-MM-dd'), [currentDate])
  const currentLines = useMemo(() => linesByDate[currentISODate] ?? new Array(20).fill(''), [currentISODate, linesByDate])

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

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
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
      className={`min-h-screen selection:bg-highlight-yellow ${fontSizeClasses[fontSize]}`}
      style={layoutVars}
    >
      <nav className="fixed top-0 left-0 right-0 h-16 bg-paper/80 backdrop-blur-sm z-50 flex items-center justify-between px-4 sm:px-6 border-b border-ink/5">
        <div className="flex items-center gap-2 sm:gap-4">
          {view === 'day' && (
            <button
              onClick={() => {
                setDirection(-1)
                setView('week')
              }}
              className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/70"
            >
              <ArrowLeft size={22} />
            </button>
          )}

          <div className="hidden sm:flex items-center">
            <img src="/sevstar-logo.svg" alt="СЕВСТАР" className="h-8 w-auto" />
          </div>

          <button
            onClick={() => setCalendarOpen(true)}
            className="h-10 px-3 rounded-xl border border-ink/10 bg-white/70 backdrop-blur hover:bg-white transition-colors flex items-center gap-2"
          >
            <CalendarDays size={18} className="text-ink/60" />
            <span className="font-serif text-base sm:text-lg">
              {format(view === 'week' ? weekStart : currentDate, 'LLLL yyyy', { locale: ru })}
            </span>
            {view === 'week' && (
              <span className="text-ink/50 text-xs sm:text-sm font-serif italic">
                Неделя {weekNumber}
              </span>
            )}
          </button>

          <button
            onClick={goPrev}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/60 hover:text-ink"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={goNext}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/60 hover:text-ink"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-ink/5 p-1 rounded-lg">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 rounded-md text-xs uppercase tracking-widest transition-all ${
                  fontSize === size ? 'bg-white shadow-sm text-ink font-bold' : 'text-ink/40 hover:text-ink/60'
                }`}
              >
                {size[0]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/50 hover:text-ink/70"
            aria-label="Настройки"
          >
            <Settings size={20} />
          </button>
          {supabaseConfigured && (
            <>
              <div className="w-[1px] h-6 bg-ink/5 mx-2" />
              <button 
                onClick={signOut}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/40 hover:text-ink/60"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="pt-16 max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <PageFlip
          direction={direction}
          pageKey={`${view}-${view === 'week' ? weekStart.toISOString() : currentDate.toISOString()}`}
        >
          {view === 'week' ? (
            <WeeklyView
              date={currentDate}
              direction={direction}
              linesByDate={linesByDate}
              focusByDate={focusByDate}
              onLinesChange={(isoDate, lines) => setLinesByDate((prev) => ({ ...prev, [isoDate]: lines }))}
              onFocusChange={(isoDate, focus) => setFocusByDate((prev) => ({ ...prev, [isoDate]: focus }))}
              notesByDate={notesByDate}
              onNotesChange={(isoDate, notes) => setNotesByDate((prev) => ({ ...prev, [isoDate]: notes }))}
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
              notes={notesByDate[currentISODate] ?? ['']}
              onNotesChange={(next) => setNotesByDate((prev) => ({ ...prev, [currentISODate]: next }))}
            />
          )}
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
        today
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
