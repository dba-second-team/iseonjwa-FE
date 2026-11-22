export type PaymentStatus = 'PAID' | 'CANCELED' | 'REFUNDED'

export type ReservationSeat = {
  section: string
  row: string
  number: number
}

export type MyReservation = {
  reservationId: number
  scheduleId: number
  performanceTitle: string
  venueName: string
  startAt: string
  seats: ReservationSeat[]
  totalAmount: number
  paymentStatus: PaymentStatus
  reservedAt: string
  posterUrl?: string | null
  scheduleRound?: number | null
}

export type MyReservationPage = {
  items: MyReservation[]
  page: number
  size: number
  totalCount: number
}