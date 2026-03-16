import { useMemo, useState } from 'react'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { InlineEditor } from '../editor/InlineEditor.tsx'

const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')

interface WeeklyViewProps {
  date: Date
  direction: number
  onOpenDay: (date: Date, direction: number) => void
  notesByDate: Record<string, string[]>
  onNotesChange: (isoDate: string, notes: string[]) => void
  linesByDate: Record<string, string[]>
  focusByDate: Record<string, string>
  onLinesChange: (isoDate: string, lines: string[]) => void
  onFocusChange: (isoDate: string, focus: string) => void
}

export const WeeklyView = ({
  date,
  direction,
  onOpenDay,
  notesByDate,
  onNotesChange,
  linesByDate,
  focusByDate,
  onLinesChange,
  onFocusChange,
}: WeeklyViewProps) => {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const [mon, tue, wed, thu, fri, sat, sun] = days

  const [weekFocus, setWeekFocus] = useState('')
  const [weekSummary, setWeekSummary] = useState('')

  const ensureDayState = (d: Date) => {
    const key = toISODate(d)
    if (!linesByDate[key]) onLinesChange(key, new Array(20).fill(''))
    if (!(key in focusByDate)) onFocusChange(key, '')
  }

  const updateLine = (d: Date, idx: number, value: string) => {
    const key = toISODate(d)
    const lines = linesByDate[key] ?? new Array(20).fill('')
    const next = [...lines]
    next[idx] = value
    onLinesChange(key, next)
  }

  const updateFocus = (d: Date, value: string) => {
    const key = toISODate(d)
    onFocusChange(key, value)
  }

  const today = useMemo(() => new Date(), [])

  const openLeft = (d: Date) => onOpenDay(d, direction === 0 ? 1 : direction)
  const openRight = (d: Date) => onOpenDay(d, direction === 0 ? -1 : direction)
  const getNotes = (d: Date) => notesByDate[toISODate(d)] ?? ['']
  const getLines = (d: Date) => linesByDate[toISODate(d)] ?? new Array(20).fill('')
  const getFocus = (d: Date) => focusByDate[toISODate(d)] ?? ''

  return (
    <div className="w-full">
      <div className="weekly-spread weekly-spread--fixed">
        <div className="weekly-page weekly-page--left">
          <DayCard
            date={mon}
            selected={isSameDay(mon, date)}
            isToday={isSameDay(mon, today)}
            lines={getLines(mon)}
            focus={getFocus(mon)}
            noteCount={Math.max(0, getNotes(mon).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(mon), [...getNotes(mon), ''])}
            onEnsure={() => ensureDayState(mon)}
            onLineChange={(idx, v) => updateLine(mon, idx, v)}
            onFocusChange={(v) => updateFocus(mon, v)}
            onOpen={() => openLeft(mon)}
            tabSide="left"
          />
          <DayCard
            date={tue}
            selected={isSameDay(tue, date)}
            isToday={isSameDay(tue, today)}
            lines={getLines(tue)}
            focus={getFocus(tue)}
            noteCount={Math.max(0, getNotes(tue).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(tue), [...getNotes(tue), ''])}
            onEnsure={() => ensureDayState(tue)}
            onLineChange={(idx, v) => updateLine(tue, idx, v)}
            onFocusChange={(v) => updateFocus(tue, v)}
            onOpen={() => openLeft(tue)}
            tabSide="left"
          />
          <DayCard
            date={wed}
            selected={isSameDay(wed, date)}
            isToday={isSameDay(wed, today)}
            lines={getLines(wed)}
            focus={getFocus(wed)}
            noteCount={Math.max(0, getNotes(wed).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(wed), [...getNotes(wed), ''])}
            onEnsure={() => ensureDayState(wed)}
            onLineChange={(idx, v) => updateLine(wed, idx, v)}
            onFocusChange={(v) => updateFocus(wed, v)}
            onOpen={() => openLeft(wed)}
            tabSide="left"
          />

          <WeekNote
            label="Фокус недели:"
            value={weekFocus}
            onChange={setWeekFocus}
            placeholder="прод сервис, менеджмент, IDE…"
          />
        </div>

        <div className="weekly-spiral" aria-hidden="true">
          <div className="weekly-spiral__inner" />
          <div className="weekly-spiral__title">СЕВСТАР ПЛАНЕР</div>
        </div>

        <div className="weekly-page weekly-page--right">
          <DayCard
            date={thu}
            selected={isSameDay(thu, date)}
            isToday={isSameDay(thu, today)}
            lines={getLines(thu)}
            focus={getFocus(thu)}
            noteCount={Math.max(0, getNotes(thu).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(thu), [...getNotes(thu), ''])}
            onEnsure={() => ensureDayState(thu)}
            onLineChange={(idx, v) => updateLine(thu, idx, v)}
            onFocusChange={(v) => updateFocus(thu, v)}
            onOpen={() => openRight(thu)}
            tabSide="right"
          />
          <DayCard
            date={fri}
            selected={isSameDay(fri, date)}
            isToday={isSameDay(fri, today)}
            lines={getLines(fri)}
            focus={getFocus(fri)}
            noteCount={Math.max(0, getNotes(fri).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(fri), [...getNotes(fri), ''])}
            onEnsure={() => ensureDayState(fri)}
            onLineChange={(idx, v) => updateLine(fri, idx, v)}
            onFocusChange={(v) => updateFocus(fri, v)}
            onOpen={() => openRight(fri)}
            tabSide="right"
          />
          <DayCard
            date={sat}
            selected={isSameDay(sat, date)}
            isToday={isSameDay(sat, today)}
            lines={getLines(sat)}
            focus={getFocus(sat)}
            noteCount={Math.max(0, getNotes(sat).filter((n) => n.trim().length > 0).length)}
            onAddNote={() => onNotesChange(toISODate(sat), [...getNotes(sat), ''])}
            onEnsure={() => ensureDayState(sat)}
            onLineChange={(idx, v) => updateLine(sat, idx, v)}
            onFocusChange={(v) => updateFocus(sat, v)}
            onOpen={() => openRight(sat)}
            tabSide="right"
          />

          <WeekSummary
            date={sun}
            selected={isSameDay(sun, date)}
            isToday={isSameDay(sun, today)}
            value={weekSummary}
            onChange={setWeekSummary}
            onOpen={() => openRight(sun)}
          />
        </div>
      </div>
    </div>
  )
}

interface DayCardProps {
  date: Date
  selected: boolean
  isToday: boolean
  focus: string
  lines: string[]
  noteCount: number
  onAddNote: () => void
  tabSide: 'left' | 'right'
  onEnsure: () => void
  onFocusChange: (value: string) => void
  onLineChange: (idx: number, value: string) => void
  onOpen: () => void
}

const DayCard = ({
  date,
  selected,
  isToday,
  focus,
  lines,
  noteCount,
  onAddNote,
  tabSide,
  onEnsure,
  onFocusChange,
  onLineChange,
  onOpen,
}: DayCardProps) => {
  const dow = format(date, 'EE', { locale: ru })
  const day = format(date, 'd')

  return (
    <div className={`day-slot day-slot--${tabSide}`}>
      <button
        type="button"
        onClick={() => {
          onEnsure()
          onOpen()
        }}
        className={`day-tab day-tab--${tabSide} ${selected ? 'day-tab--active' : ''} ${
          isToday ? 'day-tab--today' : ''
        }`}
      >
        <div className="day-tab__dow">{dow}</div>
        <div className="day-tab__day">{day}</div>
        <Maximize2 size={14} className="day-tab__icon" />
      </button>

      <motion.div layout className={`day-card ${selected ? 'day-card--active' : ''}`} onPointerDown={onEnsure}>
        <div className="day-card__header">
          <div className="day-card__headerRow">
            <div className="day-card__title">Фокус дня:</div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddNote()
              }}
              className="day-card__noteBtn"
              aria-label="Добавить заметку"
            >
              <span className="day-card__notePlus">+</span>
              {noteCount > 0 && <span className="day-card__noteCount">{noteCount}</span>}
            </button>
          </div>
          <input
            value={focus}
            onChange={(e) => onFocusChange(e.target.value)}
            className="day-card__focus"
            placeholder="главное на сегодня…"
          />
        </div>

        <div className="day-card__lines">
          {Array.from({ length: 20 }, (_, idx) => (
            <div key={idx} className="day-card__line">
              <InlineEditor
                content={lines[idx] ?? ''}
                onChange={(html) => onLineChange(idx, html)}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const WeekNote = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => {
  return (
    <div className="week-note">
      <div className="week-note__label">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="week-note__input" placeholder={placeholder} />
      <div className="week-note__lines">
        {Array.from({ length: 20 }, (_, idx) => (
          <div key={idx} className="week-note__line" />
        ))}
      </div>
    </div>
  )
}

const WeekSummary = ({
  date,
  selected,
  isToday,
  value,
  onChange,
  onOpen,
}: {
  date: Date
  selected: boolean
  isToday: boolean
  value: string
  onChange: (v: string) => void
  onOpen: () => void
}) => {
  const dow = format(date, 'EE', { locale: ru })
  const day = format(date, 'd')

  return (
    <div className="day-slot day-slot--right">
      <button
        type="button"
        onClick={onOpen}
        className={`day-tab day-tab--right ${selected ? 'day-tab--active' : ''} ${isToday ? 'day-tab--today' : ''}`}
      >
        <div className="day-tab__dow">{dow}</div>
        <div className="day-tab__day">{day}</div>
        <Maximize2 size={14} className="day-tab__icon" />
      </button>

      <div className="week-summary">
        <div className="week-summary__label">Итоги недели:</div>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="week-summary__input" placeholder="коротко…" />
        <div className="week-summary__lines">
          {Array.from({ length: 20 }, (_, idx) => (
            <div key={idx} className="week-summary__line" />
          ))}
        </div>
      </div>
    </div>
  )
}

