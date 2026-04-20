import dayjs from 'dayjs'

export function getDefaultMonthStartToToday(): [string, string] {
  return [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
}
