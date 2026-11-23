export const SEAT_SECTIONS = ['F1', 'F2', 'F3', 'F4', 'G', 'S1', 'S2'] as const

export type SeatSection = (typeof SEAT_SECTIONS)[number]

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'RESERVED'

export type Seat = {
  seatId: number
  section: SeatSection
  rowNum: string
  seatNum: number
  status: SeatStatus
  price: number | null
  /** 내가 선점 중인 좌석인지 */
  heldByMe: boolean
}

export type ScheduleSeats = {
  scheduleId: number
  seats: Seat[]
}

/** POST /api/schedules/{scheduleId}/seats/hold 응답 */
export type SeatHold = {
  seatIds: number[]
  heldUntil: string
}

export type SectionSummary = {
  section: SeatSection
  price: number | null
  availableCount: number
}

/** 좌석 선택 → 예매 확인 화면으로 넘기는 location.state */
export type HeldSeatsState = {
  seats: Seat[]
}
