import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { InlineEditor } from '../editor/InlineEditor.tsx'

interface DayViewProps {
  date: Date
  focus: string
  onFocusChange: (value: string) => void
  lines: string[]
  onLinesChange: (lines: string[]) => void
}

export const DayView = ({ date, focus, onFocusChange, lines, onLinesChange }: DayViewProps) => {
  const isoDate = format(date, 'yyyy-MM-dd')
  const navId = `day-${isoDate}`

  const handleLineChange = (index: number, content: string) => {
    const newLines = [...lines]
    newLines[index] = content
    onLinesChange(newLines)
  }

  const dayName = format(date, 'EE', { locale: ru }).toUpperCase()
  const dayNumber = format(date, 'd')

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-4 px-1 gap-3">
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
            <div className="text-[22px] leading-none tabular-nums font-light text-gray-800">{dayNumber}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#FAFAFA] rounded-sm min-h-[360px] relative overflow-hidden transition-all border border-gray-100/50 hover:border-gray-200/70 group">
        <div className="absolute inset-0 pointer-events-none px-3">
          {Array.from({ length: Math.max(lines.length, 20) }, (_, i) => (
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

        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-16 bg-gray-300/60 rounded-full" />
        </div>

        <div className="max-h-[540px] overflow-auto px-4 py-2 relative z-10">
          {lines.map((content, idx) => (
            <div key={idx} className="h-[18px] flex items-start">
              <InlineEditor
                content={content}
                onChange={(newContent) => handleLineChange(idx, newContent)}
                className="w-full text-xs text-gray-700"
                navId={navId}
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
