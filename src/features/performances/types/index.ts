export type Genre = 'K_POP' | 'HIPHOP_RANDB' | 'VALLAD' | 'ETC'

export type PerformanceStatus = 'UPCOMING' | 'ON_SALE' | 'SOLD_OUT' | 'CLOSED' | 'CANCELED'

/** GET /api/performances 목록의 한 항목 */
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