import { useMemo, type ReactNode } from 'react'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Maximize2 } from 'lucide-react'
import { InlineEditor } from '../editor/InlineEditor.tsx'

const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')

type WeekMeta = {
  focusLines: [string, string]
  summaryLines: [string, string, string]
}

interface WeeklyViewProps {
  date: Date
  direction: number
  onOpenDay: (date: Date, direction: number) => void
  linesByDate: Record<string, string[]>
  focusByDate: Record<string, string>
  weekKey: string
  weekMeta: WeekMeta
  onWeekMetaChange: (next: WeekMeta) => void
  onLinesChange: (isoDate: string, lines: string[]) => void
  onFocusChange: (isoDate: string, focus: string) => void
}

export const WeeklyView = ({
  date,
  direction,
  onOpenDay,
  linesByDate,
  focusByDate,
  weekKey,
  weekMeta,
  onWeekMetaChange,
  onLinesChange,
  onFocusChange,
}: WeeklyViewProps) => {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const [mon, tue, wed, thu, fri, sat, sun] = days
  const emptyLines = useMemo(() => new Array(20).fill(''), [])

  const ensureDayState = (d: Date) => {
    const key = toISODate(d)
    if (!linesByDate[key]) onLinesChange(key, emptyLines.slice())
    if (!(key in focusByDate)) onFocusChange(key, '')
  }

  const updateLine = (d: Date, idx: number, value: string) => {
    const key = toISODate(d)
    const lines = linesByDate[key] ?? emptyLines
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
  const getLines = (d: Date) => linesByDate[toISODate(d)] ?? emptyLines
  const getFocus = (d: Date) => focusByDate[toISODate(d)] ?? ''

  const setWeekFocusLine = (idx: 0 | 1, html: string) => {
    const nextFocusLines: [string, string] = [...weekMeta.focusLines] as [string, string]
    nextFocusLines[idx] = html
    onWeekMetaChange({ ...weekMeta, focusLines: nextFocusLines })
  }

  const setWeekSummaryLine = (idx: 0 | 1 | 2, html: string) => {
    const nextSummaryLines: [string, string, string] = [...weekMeta.summaryLines] as [string, string, string]
    nextSummaryLines[idx] = html
    onWeekMetaChange({ ...weekMeta, summaryLines: nextSummaryLines })
  }

  return (
    <div className="w-full">
      <div className="weekly-spread weekly-spread--fixed">
        <div className="weekly-page weekly-page--left">
          <WeekStripLines label="Фокус недели:" variant="focus">
            <InlineEditor
              content={weekMeta.focusLines[0] ?? ''}
              onChange={(html) => setWeekFocusLine(0, html)}
              navId={`week-focus-${weekKey}`}
              navIndex={0}
              showToolbar
              mode="minimal"
              className="week-strip__line"
            />
            <InlineEditor
              content={weekMeta.focusLines[1] ?? ''}
              onChange={(html) => setWeekFocusLine(1, html)}
              navId={`week-focus-${weekKey}`}
              navIndex={1}
              showToolbar
              mode="minimal"
              className="week-strip__line"
            />
          </WeekStripLines>
          <DayCard
            date={mon}
            selected={isSameDay(mon, date)}
            isToday={isSameDay(mon, today)}
            lines={getLines(mon)}
            focus={getFocus(mon)}
            isoDate={toISODate(mon)}
            onEnsure={() => ensureDayState(mon)}
            onLineChange={(idx, v) => updateLine(mon, idx, v)}
            onFocusChange={(v) => updateFocus(mon, v)}
            onOpen={() => openLeft(mon)}
            tabSide="left"
            lineCount={20}
          />
          <DayCard
            date={tue}
            selected={isSameDay(tue, date)}
            isToday={isSameDay(tue, today)}
            lines={getLines(tue)}
            focus={getFocus(tue)}
            isoDate={toISODate(tue)}
            onEnsure={() => ensureDayState(tue)}
            onLineChange={(idx, v) => updateLine(tue, idx, v)}
            onFocusChange={(v) => updateFocus(tue, v)}
            onOpen={() => openLeft(tue)}
            tabSide="left"
            lineCount={20}
          />
          <DayCard
            date={wed}
            selected={isSameDay(wed, date)}
            isToday={isSameDay(wed, today)}
            lines={getLines(wed)}
            focus={getFocus(wed)}
            isoDate={toISODate(wed)}
            onEnsure={() => ensureDayState(wed)}
            onLineChange={(idx, v) => updateLine(wed, idx, v)}
            onFocusChange={(v) => updateFocus(wed, v)}
            onOpen={() => openLeft(wed)}
            tabSide="left"
            lineCount={20}
          />
        </div>

        <div className="weekly-spiral" aria-hidden="true">
          <div className="weekly-spiral__inner" />
        </div>

        <div className="weekly-page weekly-page--right">
          <DayCard
            date={thu}
            selected={isSameDay(thu, date)}
            isToday={isSameDay(thu, today)}
            lines={getLines(thu)}
            focus={getFocus(thu)}
            isoDate={toISODate(thu)}
            onEnsure={() => ensureDayState(thu)}
            onLineChange={(idx, v) => updateLine(thu, idx, v)}
            onFocusChange={(v) => updateFocus(thu, v)}
            onOpen={() => openRight(thu)}
            tabSide="right"
            lineCount={20}
          />
          <DayCard
            date={fri}
            selected={isSameDay(fri, date)}
            isToday={isSameDay(fri, today)}
            lines={getLines(fri)}
            focus={getFocus(fri)}
            isoDate={toISODate(fri)}
            onEnsure={() => ensureDayState(fri)}
            onLineChange={(idx, v) => updateLine(fri, idx, v)}
            onFocusChange={(v) => updateFocus(fri, v)}
            onOpen={() => openRight(fri)}
            tabSide="right"
            lineCount={20}
          />
          <DayCard
            date={sat}
            selected={isSameDay(sat, date)}
            isToday={isSameDay(sat, today)}
            lines={getLines(sat)}
            focus={getFocus(sat)}
            isoDate={toISODate(sat)}
            onEnsure={() => ensureDayState(sat)}
            onLineChange={(idx, v) => updateLine(sat, idx, v)}
            onFocusChange={(v) => updateFocus(sat, v)}
            onOpen={() => openRight(sat)}
            tabSide="right"
            lineCount={12}
          />

          <DayCard
            date={sun}
            selected={isSameDay(sun, date)}
            isToday={isSameDay(sun, today)}
            lines={getLines(sun)}
            focus={getFocus(sun)}
            isoDate={toISODate(sun)}
            onEnsure={() => ensureDayState(sun)}
            onLineChange={(idx, v) => updateLine(sun, idx, v)}
            onFocusChange={(v) => updateFocus(sun, v)}
            onOpen={() => openRight(sun)}
            tabSide="right"
            lineCount={12}
          />
          <WeekStripLines label="Итоги недели:" variant="summary">
            <InlineEditor
              content={weekMeta.summaryLines[0] ?? ''}
              onChange={(html) => setWeekSummaryLine(0, html)}
              navId={`week-summary-${weekKey}`}
              navIndex={0}
              showToolbar
              mode="minimal"
              className="week-strip__line"
            />
            <InlineEditor
              content={weekMeta.summaryLines[1] ?? ''}
              onChange={(html) => setWeekSummaryLine(1, html)}
              navId={`week-summary-${weekKey}`}
              navIndex={1}
              showToolbar
              mode="minimal"
              className="week-strip__line"
            />
            <InlineEditor
              content={weekMeta.summaryLines[2] ?? ''}
              onChange={(html) => setWeekSummaryLine(2, html)}
              navId={`week-summary-${weekKey}`}
              navIndex={2}
              showToolbar
              mode="minimal"
              className="week-strip__line"
            />
          </WeekStripLines>
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
  isoDate: string
  tabSide: 'left' | 'right'
  lineCount: number
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
  isoDate,
  tabSide,
  lineCount,
  onEnsure,
  onFocusChange,
  onLineChange,
  onOpen,
}: DayCardProps) => {
  const dow = format(date, 'EE', { locale: ru })
  const day = format(date, 'd')

  return (
    <div className={`day-slot day-slot--${tabSide}`} data-week-iso={isoDate}>
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

      <div className={`day-card ${selected ? 'day-card--active' : ''}`} onPointerDown={onEnsure}>
        <div className="day-card__header">
          <div className="day-card__headerRow">
            <div className="day-card__title">Фокус дня:</div>
            <input
              value={focus}
              onChange={(e) => onFocusChange(e.target.value)}
              className="day-card__focus day-card__focus--inline"
              placeholder="главное…"
            />
          </div>
        </div>

        <div className="day-card__lines">
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx} className="day-card__line">
              <InlineEditor
                content={lines[idx] ?? ''}
                onChange={(html) => onLineChange(idx, html)}
                navId={`week-${isoDate}`}
                navIndex={idx}
                showToolbar
                mode="minimal"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const WeekStripLines = ({
  label,
  children,
  variant,
}: {
  label: string
  children: ReactNode
  variant: 'focus' | 'summary'
}) => {
  return (
    <div className={`week-strip week-strip--lines ${variant === 'summary' ? 'week-strip--summary' : ''}`}>
      <div className="week-strip__label">{label}</div>
      <div className="week-strip__lines">{children}</div>
    </div>
  )
}

