import dayjs from 'dayjs'

export const currencyMap = new Map<string, number>().set('TWD', 35.54)

export function parseTimeRangeToList(range: string[]): string[] {
  const [start, end] = range
  const diff = dayjs(end).diff(dayjs(start), 'day')
  const result: string[] = []
  for (let i = 0; i <= diff; i++) {
    result.push(dayjs(start).add(i, 'day').format('YYYY-MM-DD'))
  }
  return result
}
