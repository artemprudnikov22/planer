import { Children, useMemo, type ReactNode } from 'react'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { InlineEditor } from '../editor/InlineEditor.tsx'

const toISODate = (d: Date) => format(d, 'yyyy-MM-dd')

type WeekMeta = {
  focusLine: string
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

  const setWeekFocusLine = (html: string) => {
    onWeekMetaChange({ ...weekMeta, focusLine: html })
  }

  const setWeekSummaryLine = (idx: 0 | 1 | 2, html: string) => {
    const nextSummaryLines: [string, string, string] = [...weekMeta.summaryLines] as [string, string, string]
    nextSummaryLines[idx] = html
    onWeekMetaChange({ ...weekMeta, summaryLines: nextSummaryLines })
  }

  const dayName = (d: Date) => format(d, 'EE', { locale: ru }).toUpperCase()
  const dayNumber = (d: Date) => format(d, 'd')

  return (
    <div className="relative flex min-h-[700px]">
      <div className="flex-1 p-6 border-r border-gray-200/50 relative">
        <div className="mb-5">
          <div className="mb-2 px-1 flex items-baseline gap-2">
            <span className="text-[11px] text-gray-500 font-light">Фокус недели:</span>
            <InlineEditor
              content={weekMeta.focusLine ?? ''}
              onChange={(html) => setWeekFocusLine(html)}
              navId={`week-focus-${weekKey}`}
              navIndex={0}
              showToolbar
              mode="minimal"
              className="text-[11px] text-gray-700 flex-1 min-w-0 border-b border-gray-200/60 pb-[1px]"
            />
          </div>
        </div>

        <DayBlock
          dayName={dayName(mon)}
          dayNumber={dayNumber(mon)}
          isoDate={toISODate(mon)}
          selected={isSameDay(mon, date)}
          isToday={isSameDay(mon, today)}
          focus={getFocus(mon)}
          lines={getLines(mon)}
          lineCount={20}
          onFocusChange={(v) => updateFocus(mon, v)}
          onLineChange={(idx, v) => updateLine(mon, idx, v)}
          onOpen={() => openLeft(mon)}
        />
        <DayBlock
          dayName={dayName(tue)}
          dayNumber={dayNumber(tue)}
          isoDate={toISODate(tue)}
          selected={isSameDay(tue, date)}
          isToday={isSameDay(tue, today)}
          focus={getFocus(tue)}
          lines={getLines(tue)}
          lineCount={20}
          onFocusChange={(v) => updateFocus(tue, v)}
          onLineChange={(idx, v) => updateLine(tue, idx, v)}
          onOpen={() => openLeft(tue)}
        />
        <DayBlock
          dayName={dayName(wed)}
          dayNumber={dayNumber(wed)}
          isoDate={toISODate(wed)}
          selected={isSameDay(wed, date)}
          isToday={isSameDay(wed, today)}
          focus={getFocus(wed)}
          lines={getLines(wed)}
          lineCount={20}
          onFocusChange={(v) => updateFocus(wed, v)}
          onLineChange={(idx, v) => updateLine(wed, idx, v)}
          onOpen={() => openLeft(wed)}
        />
      </div>

      <div className="flex-1 p-6 relative">
        <div
          className="absolute bg-white border-2 border-purple-100 rounded-lg transition-all hover:border-purple-200 z-30"
          style={{
            top: '72px',
            right: '24px',
            width: '44px',
            height: '44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-[18px] leading-none tabular-nums font-light">{dayNumber(thu)}</div>
          <div className="text-[9px] mt-0.5 text-gray-500 uppercase tracking-wide">{dayName(thu)}</div>
        </div>

        <div
          className={`absolute rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 cursor-pointer ${
            isSameDay(fri, today) ? 'bg-[#6A1B9A]' : 'bg-white border-2 border-purple-100'
          } z-30`}
          style={{
            top: '216px',
            right: '24px',
            width: '44px',
            height: '44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className={`text-[18px] leading-none tabular-nums font-medium ${
              isSameDay(fri, today) ? 'text-white' : 'text-gray-900'
            }`}
          >
            {dayNumber(fri)}
          </div>
          <div className={`text-[9px] mt-0.5 uppercase tracking-wide ${isSameDay(fri, today) ? 'text-purple-200' : 'text-gray-500'}`}>
            {dayName(fri)}
          </div>
        </div>

        <DayBlock
          dayName={dayName(thu)}
          dayNumber={dayNumber(thu)}
          isoDate={toISODate(thu)}
          selected={isSameDay(thu, date)}
          isToday={isSameDay(thu, today)}
          focus={getFocus(thu)}
          lines={getLines(thu)}
          lineCount={20}
          onFocusChange={(v) => updateFocus(thu, v)}
          onLineChange={(idx, v) => updateLine(thu, idx, v)}
          onOpen={() => openRight(thu)}
        />
        <DayBlock
          dayName={dayName(fri)}
          dayNumber={dayNumber(fri)}
          isoDate={toISODate(fri)}
          selected={isSameDay(fri, date)}
          isToday={isSameDay(fri, today)}
          focus={getFocus(fri)}
          lines={getLines(fri)}
          lineCount={20}
          onFocusChange={(v) => updateFocus(fri, v)}
          onLineChange={(idx, v) => updateLine(fri, idx, v)}
          onOpen={() => openRight(fri)}
        />
        <DayBlock
          dayName={dayName(sat)}
          dayNumber={dayNumber(sat)}
          isoDate={toISODate(sat)}
          selected={isSameDay(sat, date)}
          isToday={isSameDay(sat, today)}
          focus={getFocus(sat)}
          lines={getLines(sat)}
          lineCount={12}
          onFocusChange={(v) => updateFocus(sat, v)}
          onLineChange={(idx, v) => updateLine(sat, idx, v)}
          onOpen={() => openRight(sat)}
        />
        <DayBlock
          dayName={dayName(sun)}
          dayNumber={dayNumber(sun)}
          isoDate={toISODate(sun)}
          selected={isSameDay(sun, date)}
          isToday={isSameDay(sun, today)}
          focus={getFocus(sun)}
          lines={getLines(sun)}
          lineCount={12}
          onFocusChange={(v) => updateFocus(sun, v)}
          onLineChange={(idx, v) => updateLine(sun, idx, v)}
          onOpen={() => openRight(sun)}
        />

        <WeekBlock
          label="Итоги недели:"
          bgClassName="bg-[#FFF8E7] border-amber-100/50"
          lineBorderClassName="border-amber-200/40"
          outerClassName="mt-5"
        >
          <InlineEditor
            content={weekMeta.summaryLines[0] ?? ''}
            onChange={(html) => setWeekSummaryLine(0, html)}
            navId={`week-summary-${weekKey}`}
            navIndex={0}
            showToolbar
            mode="minimal"
            className="text-xs text-gray-700 h-[18px]"
          />
          <InlineEditor
            content={weekMeta.summaryLines[1] ?? ''}
            onChange={(html) => setWeekSummaryLine(1, html)}
            navId={`week-summary-${weekKey}`}
            navIndex={1}
            showToolbar
            mode="minimal"
            className="text-xs text-gray-700 h-[18px]"
          />
          <InlineEditor
            content={weekMeta.summaryLines[2] ?? ''}
            onChange={(html) => setWeekSummaryLine(2, html)}
            navId={`week-summary-${weekKey}`}
            navIndex={2}
            showToolbar
            mode="minimal"
            className="text-xs text-gray-700 h-[18px]"
          />
        </WeekBlock>
      </div>
    </div>
  )
}

const WeekBlock = ({
  label,
  bgClassName,
  lineBorderClassName,
  outerClassName,
  children,
}: {
  label: string
  bgClassName: string
  lineBorderClassName: string
  outerClassName: string
  children: ReactNode
}) => {
  const lines = Children.toArray(children)
  return (
    <div className={outerClassName}>
      <div className="mb-2 px-1">
        <span className="text-[11px] text-gray-500 font-light">{label}</span>
      </div>
      <div className={`rounded-sm relative overflow-hidden border min-h-[80px] ${bgClassName}`}>
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`border-b ${lineBorderClassName}`}
              style={{
                position: 'absolute',
                left: '16px',
                right: '16px',
                top: `${14 + i * 18}px`,
                height: '1px',
              }}
            />
          ))}
        </div>
        <div className="relative px-4 py-2">
          {lines.map((node, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: '16px',
                right: '16px',
                top: `${10 + idx * 18}px`,
                height: '18px',
              }}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DayBlock = ({
  dayName,
  dayNumber,
  isoDate,
  selected,
  isToday,
  focus,
  lines,
  lineCount,
  onFocusChange,
  onLineChange,
  onOpen,
}: {
  dayName: string
  dayNumber: string
  isoDate: string
  selected: boolean
  isToday: boolean
  focus: string
  lines: string[]
  lineCount: number
  onFocusChange: (value: string) => void
  onLineChange: (idx: number, value: string) => void
  onOpen: () => void
}) => {
  const hasContent = Boolean(focus?.trim()) || lines.some((l) => Boolean(l?.trim()))

  return (
    <div className="mb-4" data-week-iso={isoDate}>
      <div className="flex items-center justify-between mb-2 px-1 gap-3">
        <div className="flex items-baseline gap-3 min-w-0 flex-1">
          <span className="text-[11px] text-gray-500 font-light">Фокус дня:</span>
          <InlineEditor
            content={focus}
            onChange={(html) => onFocusChange(html)}
            navId={`focus-${isoDate}`}
            navIndex={0}
            showToolbar
            mode="minimal"
            className="text-[11px] text-gray-700 flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{dayName}</span>
          <div className="text-right">
            <div
              className={`text-[22px] leading-none tabular-nums font-light ${
                isToday ? 'text-[#6A1B9A] font-medium' : 'text-gray-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onOpen()
                }}
                className="leading-none tabular-nums"
                aria-label="Открыть день"
              >
                {dayNumber}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`bg-[#FAFAFA] rounded-sm min-h-[100px] relative overflow-hidden transition-all border border-gray-100/50 hover:border-gray-200/70 group ${
          selected ? 'border-purple-200' : 'border-gray-100/50'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none px-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="border-b border-gray-200/50"
              style={{
                position: 'absolute',
                left: '16px',
                right: '32px',
                top: `${12 + i * 18}px`,
                height: '1px',
              }}
            />
          ))}
        </div>

        {hasContent && (
          <div className="absolute left-3 top-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
        )}

        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-16 bg-gray-300/60 rounded-full" />
        </div>

        <div className="max-h-[200px] overflow-auto px-4 py-2 relative z-10">
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx} className="h-[18px] flex items-start">
              <InlineEditor
                content={lines[idx] ?? ''}
                onChange={(html) => onLineChange(idx, html)}
                navId={`week-${isoDate}`}
                navIndex={idx}
                showToolbar
                mode="minimal"
                className="w-full text-xs text-gray-700"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
