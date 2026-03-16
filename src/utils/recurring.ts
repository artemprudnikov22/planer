import { 
  isSameDay, 
  isBefore, 
  startOfDay,
  getDay
} from 'date-fns'

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'weekdays'

export interface BaseEvent {
  id: string
  title: string
  is_recurring: boolean
  recurrence_type?: RecurrenceType
  start_time: Date
  end_time: Date
}

export const getOccurrencesForDate = (events: BaseEvent[], date: Date): BaseEvent[] => {
  const targetDate = startOfDay(date)
  const occurrences: BaseEvent[] = []

  events.forEach(event => {
    const eventStart = startOfDay(event.start_time)
    
    // If it's not recurring, check if it's on the same day
    if (!event.is_recurring) {
      if (isSameDay(eventStart, targetDate)) {
        occurrences.push(event)
      }
      return
    }

    // For recurring events
    // Skip if target date is before start date
    if (isBefore(targetDate, eventStart)) return

    switch (event.recurrence_type) {
      case 'daily':
        occurrences.push(event)
        break
      
      case 'weekly':
        // Check if day of week is the same
        if (getDay(eventStart) === getDay(targetDate)) {
          occurrences.push(event)
        }
        break
      
      case 'monthly':
        // Check if day of month is the same
        if (eventStart.getDate() === targetDate.getDate()) {
          occurrences.push(event)
        }
        break
      
      case 'weekdays':
        {
          const dayOfWeek = getDay(targetDate)
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            occurrences.push(event)
          }
          break
        }
    }
  })

  return occurrences
}
