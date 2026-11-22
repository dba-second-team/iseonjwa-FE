export const SEAT_SECTIONS = ['F1', 'F2', 'F3', 'F4', 'G', 'S1', 'S2'] as const

export type SeatSection = (typeof SEAT_SECTIONS)[number]

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'RESERVED'

/**
 * GET /api/schedules/{scheduleId}/seats 의 좌석 하나
 * (좌석 배치 조회 API가 아직 없어 seat 테이블 컬럼 기준으로 정한 형태. 백엔드와 맞춰야 함)
 */
export type Seat = {
  seatId: number
  section: SeatSection
  rowNum: string
  seatNum: number
  status: SeatStatus
  /** 구역 가격 */
  price: number
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
