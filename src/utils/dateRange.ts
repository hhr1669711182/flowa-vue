export function formatYmdLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getDefaultSunToTodayRange(now: Date = new Date()): [string, string] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dow = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - dow)
  return [formatYmdLocal(start), formatYmdLocal(today)]
}

/** Month start (day 1) to today, in local date strings (avoids UTC timezone shift) */
export function getDefaultMonthStartToToday(now: Date = new Date()): [string, string] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return [formatYmdLocal(start), formatYmdLocal(today)]
}
