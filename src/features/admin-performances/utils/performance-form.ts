import type { CreatePerformanceRequest, Genre, SeatSection } from '../types'

export const TITLE_MAX_LENGTH = 18
export const VENUE_MAX_LENGTH = 200
export const DESCRIPTION_MAX_LENGTH = 1500
export const MAX_SCHEDULE_COUNT = 4
export const MAX_TICKETS_LIMIT = 10
export const POSTER_MAX_BYTES = 5 * 1024 * 1024
export const POSTER_ACCEPT = 'image/jpeg,image/png'

// 화면에 보이는 순서 (Figma 기준)
export const SEAT_SECTIONS: SeatSection[] = ['S1', 'S2', 'F1', 'F2', 'F3', 'F4', 'G']

export type PerformanceFormValues = {
  genre: Genre | null
  title: string
  venueName: string
  description: string
  runningTime: string
  maxTicketsPerMember: number
  // datetime-local 값 ("2026-12-03T19:00"), 길이 = 회차 수
  schedules: string[]
  // 숫자만 담은 문자열 ("45000")
  prices: Record<SeatSection, string>
}

export type PerformanceFormField = 'poster' | 'genre' | 'title' | 'venueName' | 'runningTime' | 'schedules' | 'prices'
export type PerformanceFormErrors = Partial<Record<PerformanceFormField, string>>

export const INITIAL_VALUES: PerformanceFormValues = {
  genre: null,
  title: '',
  venueName: '',
  description: '',
  runningTime: '',
  maxTicketsPerMember: 1,
  schedules: [''],
  prices: { S1: '', S2: '', F1: '', F2: '', F3: '', F4: '', G: '' },
}

/** 버튼 활성화 기준: 필수 항목이 모두 채워졌는지 */
export function isFilled(values: PerformanceFormValues): boolean {
  return (
    values.genre !== null &&
    values.title.trim() !== '' &&
    values.venueName.trim() !== '' &&
    values.runningTime !== '' &&
    values.schedules.every(schedule => schedule !== '') &&
    SEAT_SECTIONS.every(section => values.prices[section] !== '')
  )
}

/** 제출 직전 검증. 서버도 같은 규칙으로 검증하지만 바로 알려 주려고 한 번 더 확인 */
export function validate(values: PerformanceFormValues, now = new Date()): PerformanceFormErrors {
  const errors: PerformanceFormErrors = {}
  const runningTime = Number(values.runningTime)

  if (!values.genre) errors.genre = '공연 장르를 선택해 주세요.'
  if (values.title.trim() === '') errors.title = '공연명을 입력해 주세요.'
  if (values.venueName.trim() === '') errors.venueName = '공연장 이름을 입력해 주세요.'
  if (!Number.isInteger(runningTime) || runningTime <= 0) errors.runningTime = '러닝 타임은 1분 이상으로 입력해 주세요.'
  if (SEAT_SECTIONS.some(section => values.prices[section] === '')) errors.prices = '모든 좌석 등급의 가격을 입력해 주세요.'

  const scheduleError = validateSchedules(values.schedules, errors.runningTime ? null : runningTime, now)
  if (scheduleError) errors.schedules = scheduleError

  return errors
}

function validateSchedules(schedules: string[], runningTime: number | null, now: Date): string | undefined {
  if (schedules.some(schedule => schedule === '')) return '모든 회차의 날짜와 시간을 선택해 주세요.'

  const times = schedules.map(schedule => new Date(schedule).getTime()).sort((a, b) => a - b)
  if (times.some(time => Number.isNaN(time))) return '날짜와 시간을 다시 선택해 주세요.'
  if (times[0] <= now.getTime()) return '지금 이후의 날짜와 시간을 선택해 주세요.'

  // 앞 회차가 끝나기 전에 다음 회차가 시작하면 안 됨 (서버의 SCHEDULE_CONFLICT와 같은 기준)
  if (runningTime !== null) {
    for (let index = 1; index < times.length; index++) {
      if (times[index - 1] + runningTime * 60_000 > times[index]) return '회차끼리 공연 시간이 겹쳐요.'
    }
  }
  return undefined
}

export function toRequest(values: PerformanceFormValues): CreatePerformanceRequest {
  const description = values.description.trim()

  return {
    title: values.title.trim(),
    genre: values.genre as Genre,
    venueName: values.venueName.trim(),
    description: description === '' ? null : description,
    runningTime: Number(values.runningTime),
    maxTicketsPerMember: values.maxTicketsPerMember,
    // datetime-local은 시간대가 없어서, 브라우저 시간대 기준으로 해석한 뒤 ISO(UTC)로 보냄
    // 서버는 OffsetDateTime으로 받아 Asia/Seoul로 바꿔 저장함
    schedules: values.schedules.map(schedule => ({ startAt: new Date(schedule).toISOString() })),
    prices: SEAT_SECTIONS.map(section => ({ section, price: Number(values.prices[section]) })),
  }
}

/** 회차 수가 바뀌면 입력한 값은 유지하고 길이만 맞춤 */
export function resizeSchedules(schedules: string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => schedules[index] ?? '')
}

/** "45000" → "45,000" */
export function formatPriceInput(digits: string): string {
  return digits === '' ? '' : Number(digits).toLocaleString('ko-KR')
}

/** 입력값에서 숫자만 남김. 앞자리 0 제거, 자릿수 제한 */
export function toDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, maxLength)
}

/** datetime-local의 min 값 ("2026-11-22T22:30") */
export function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
