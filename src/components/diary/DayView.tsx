import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { InlineEditor } from '../editor/InlineEditor.tsx'

interface DayViewProps {
  date: Date
  lines: string[]
  onLinesChange: (lines: string[]) => void
}

export const DayView = ({ date, lines, onLinesChange }: DayViewProps) => {
  const navId = `day-${format(date, 'yyyy-MM-dd')}`

  const handleLineChange = (index: number, content: string) => {
    const newLines = [...lines]
    newLines[index] = content
    onLinesChange(newLines)
  }

  return (
    <div className="daily-sheet">
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif lowercase tracking-tight">
            {format(date, 'EEEE', { locale: ru })}
          </h1>
          <div className="text-ink/40 font-serif italic text-lg">
            {format(date, 'd MMMM yyyy', { locale: ru })}
          </div>
        </div>
      </div>

      {/* Interactive Lines */}
      <div className="space-y-0">
        {lines.map((content, idx) => (
          <div key={idx} className="paper-line group relative">
            <span className="absolute left-0 -ml-8 text-[10px] text-ink/20 font-sans tabular-nums mt-1">
              {(idx + 7).toString().padStart(2, '0')}:00
            </span>
            <InlineEditor
              content={content}
              onChange={(newContent) => handleLineChange(idx, newContent)}
              className="flex-1 h-full"
              navId={navId}
              navIndex={idx}
              showToolbar
              mode="minimal"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
