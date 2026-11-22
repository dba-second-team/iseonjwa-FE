export type PaymentStatus = 'PAID' | 'CANCELED' | 'REFUNDED'

export type SeatSection = 'F1' | 'F2' | 'F3' | 'F4' | 'S1' | 'S2' | 'G'

export type AdminReservationSeat = {
  section: SeatSection
  rowNum: string
  seatNum: number
}

export type AdminReservation = {
  reservationId: number
  memberName: string
  scheduleId: number
  scheduleNumber: number
  startAt: string
  reservedAt: string
  seats: AdminReservationSeat[]
  ticketCount: number
  paidAmount: number
  status: PaymentStatus
  expectedRefundAmount: number | null
  refundAmount: number | null
}

export type AdminReservationPage = {
  items: AdminReservation[]
  page: number
  size: number
  totalCount: number
}