export type Genre = 'K_POP' | 'HIPHOP_RANDB' | 'VALLAD' | 'ETC'

export type SeatSection = 'S1' | 'S2' | 'F1' | 'F2' | 'F3' | 'F4' | 'G'

export type AdminPerformance = {
  performanceId: number
  title: string
  genre: Genre
  posterUrl: string | null
  soldTicketCount: number
}

export type AdminPerformancePage = {
  items: AdminPerformance[]
  page: number
  size: number
  totalCount: number
}

export type CreatePerformanceRequest = {
  title: string
  genre: Genre
  venueName: string
  description: string | null
  runningTime: number
  maxTicketsPerMember: number
  schedules: { startAt: string }[]
  prices: { section: SeatSection; price: number }[]
}

export type CreatePerformanceResponse = {
  performanceId: number
  status: string
  schedules: { scheduleId: number; startAt: string }[]
}
