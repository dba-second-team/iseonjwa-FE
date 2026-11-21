// export type PaymentStatus = 'PAID' | 'CANCELED' | 'REFUNDED';
export type ReservationStatus = 'CONFIRMED' | 'CANCELED' | 'PENDING';

export type ReservationSeat = {
  section: string
  row: string
  number: number
}

export type MyReservation = {
  reservationId: number
  performanceTitle: string
  venueName: string
  startAt: string
  seats: ReservationSeat[]
  totalAmount: number
  // paymentStatus: PaymentStatus
  status: ReservationStatus
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