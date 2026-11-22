export type Genre = 'K_POP' | 'HIPHOP_RANDB' | 'VALLAD' | 'ETC'

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