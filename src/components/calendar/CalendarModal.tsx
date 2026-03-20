import { AnimatePresence, motion } from 'framer-motion'
import { addDays, addMonths, addYears, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths, subYears } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface CalendarModalProps {
  open: boolean
  value: Date
  onClose: () => void
  onSelect: (date: Date) => void
}

export const CalendarModal = ({ open, value, onClose, onSelect }: CalendarModalProps) => {
  const [cursorMonth, setCursorMonth] = useState<Date | null>(null)
  const activeMonth = cursorMonth ?? startOfMonth(value)

  const months = useMemo(() => {
    const base = startOfMonth(activeMonth)
    return [base, addMonths(base, 1)]
  }, [activeMonth])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setCursorMonth(null)
              onClose()
            }
          }}
        >
          <motion.div
            className="calendar-sheet"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="calendar-sheet__top">
              <div className="calendar-sheet__nav">
                <button
                  onClick={() => setCursorMonth((m) => subYears(m ?? activeMonth, 1))}
                  className="calendar-sheet__icon"
                  type="button"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCursorMonth((m) => subMonths(m ?? activeMonth, 1))}
                  className="calendar-sheet__icon"
                  type="button"
                >
                  <ChevronLeft size={22} />
                </button>
              </div>

              <div className="calendar-sheet__title">
                {format(activeMonth, 'LLLL yyyy', { locale: ru })}
              </div>

              <div className="calendar-sheet__nav">
                <button
                  onClick={() => setCursorMonth((m) => addMonths(m ?? activeMonth, 1))}
                  className="calendar-sheet__icon"
                  type="button"
                >
                  <ChevronRight size={22} />
                </button>
                <button
                  onClick={() => setCursorMonth((m) => addYears(m ?? activeMonth, 1))}
                  className="calendar-sheet__icon"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <button
                onClick={() => {
                  setCursorMonth(null)
                  onClose()
                }}
                className="calendar-sheet__close"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="calendar-sheet__months">
              {months.map((month) => (
                <MonthGrid
                  key={month.toISOString()}
                  month={month}
                  value={value}
                  onSelect={(d) => {
                    onSelect(d)
                    setCursorMonth(null)
                    onClose()
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const MonthGrid = ({
  month,
  value,
  onSelect,
}: {
  month: Date
  value: Date
  onSelect: (d: Date) => void
}) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(start, i)), [start])

  return (
    <div className="month-grid">
      <div className="month-grid__name">{format(month, 'LLLL yyyy', { locale: ru })}</div>
      <div className="month-grid__dow">
        {weekDays.map((d) => (
          <div key={d} className="month-grid__dowcell">
            {d}
          </div>
        ))}
      </div>
      <div className="month-grid__cells">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month)
          const selected = isSameDay(d, value)
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={`month-grid__cell ${inMonth ? '' : 'month-grid__cell--muted'} ${
                selected ? 'month-grid__cell--selected' : ''
              }`}
            >
              <div className="month-grid__num">{format(d, 'd')}</div>
              <div className={`month-grid__dot ${selected ? 'month-grid__dot--selected' : ''}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
