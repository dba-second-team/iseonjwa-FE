export type Genre = 'K_POP' | 'HIPHOP_RANDB' | 'VALLAD' | 'ETC'

export type PerformanceStatus = 'UPCOMING' | 'ON_SALE' | 'SOLD_OUT' | 'CLOSED' | 'CANCELED'

export type PerformanceSummary = {
  performanceId: number
  title: string
  genre: Genre
  posterUrl: string | null
  status: PerformanceStatus
  startDate: string | null
  endDate: string | null
  minPrice: number | null
  maxPrice: number | null
}

export type PerformancePage = {
  items: PerformanceSummary[]
  page: number
  size: number
  totalCount: number
}

export type PerformanceDetail = {
  performanceId: number
  title: string
  genre: Genre
  posterUrl: string | null
  status: PerformanceStatus
  venueName: string
  runningTime: number
  description: string | null
  maxTicketsPerMember: number
  startDate: string | null
  endDate: string | null
}

export type Schedule = {
  scheduleId: number
  round: number
  startAt: string
}