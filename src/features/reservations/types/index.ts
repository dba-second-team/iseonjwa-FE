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
  scheduleRound?: number | null // scheduleRound: number
}

export type MyReservationPage = {
  items: MyReservation[]
  page: number
  size: number
  totalCount: number
}

export type CancelReservationResult = {
  reservationId: number
  status: 'CANCELED'
  paidAmount: number
  cancelFee: number
  refundAmount: number
}
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER'

export type CreateReservationRequest = {
  scheduleId: number
  seatIds: number[]
  paymentMethod: PaymentMethod
}

/** POST /api/reservations 응답 */
export type CreatedReservation = {
  reservationId: number
  scheduleId: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED'
  seats: { seatId: number; section: string; price: number }[]
  totalAmount: number
  paidAt: string
}
