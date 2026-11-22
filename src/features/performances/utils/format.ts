import type { Genre, PerformanceStatus } from '../types'

function formatDate(date: string): string {
  return date.replaceAll('-', '.')
}

export function formatPeriod(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '일정 미정'
  if (startDate === endDate) return formatDate(startDate)
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
}

export function formatPriceRange(minPrice: number | null, maxPrice: number | null): string {
  if (minPrice === null) return '가격 미정'
  const price = `${minPrice.toLocaleString('ko-KR')}원`
  return maxPrice !== null && maxPrice > minPrice ? `${price} ~` : price
}

const GENRE_LABEL: Record<Genre, string> = {
  K_POP: 'K-팝',
  HIPHOP_RANDB: '힙합/R&B',
  VALLAD: '발라드',
  ETC: '기타',
}

export function formatGenre(genre: Genre): string {
  return GENRE_LABEL[genre] ?? '기타'
}

function splitDateTime(startAt: string) {
  const [date, time = ''] = startAt.split('T')
  const [year, month, day] = date.split('-')
  return { year, month: Number(month), day: Number(day), date, time: time.slice(0, 5) }
}

export function formatScheduleShort(round: number, startAt: string): { round: string; dateTime: string } {
  const { month, day, time } = splitDateTime(startAt)
  return { round: `${round}회차`, dateTime: `${month}월 ${day}일 / ${time}` }
}

export function formatScheduleOption(startAt: string): { date: string; time: string } {
  const { date, time } = splitDateTime(startAt)
  return { date, time }
}

export function getUnavailableLabel(status: PerformanceStatus, scheduleCount: number): string | null {
  if (status === 'UPCOMING') return '오픈 예정인 공연입니다'
  if (status === 'SOLD_OUT') return '매진된 공연입니다'
  if (status === 'CLOSED' || status === 'CANCELED') return '마감된 공연입니다'
  if (scheduleCount === 0) return '예매 가능한 회차가 없습니다'
  return null
}