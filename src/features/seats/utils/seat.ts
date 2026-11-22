import { SEAT_SECTIONS, type Seat, type SeatSection, type SectionSummary } from '../types'

export function isSeatSection(value: string | null): value is SeatSection {
  return SEAT_SECTIONS.some(section => section === value)
}

/** 내가 선점한 좌석도 다시 고를 수 있음 */
export function isSelectable(seat: Seat): boolean {
  return seat.status === 'AVAILABLE' || seat.heldByMe
}

export function summarizeSections(seats: Seat[]): Map<SeatSection, SectionSummary> {
  const summaries = new Map<SeatSection, SectionSummary>(
    SEAT_SECTIONS.map(section => [section, { section, price: null, availableCount: 0 }]),
  )
  for (const seat of seats) {
    const summary = summaries.get(seat.section)
    if (!summary) continue
    summary.price ??= seat.price
    if (isSelectable(seat)) summary.availableCount += 1
  }
  return summaries
}

function compareRow(a: string, b: string): number {
  return a.localeCompare(b, 'ko-KR', { numeric: true })
}

/** 열 순서대로, 열 안에서는 번호 순서대로 */
export function groupByRow(seats: Seat[]): { rowNum: string; seats: Seat[] }[] {
  const rows = new Map<string, Seat[]>()
  for (const seat of seats) {
    const row = rows.get(seat.rowNum)
    if (row) row.push(seat)
    else rows.set(seat.rowNum, [seat])
  }
  return [...rows.entries()]
    .sort(([a], [b]) => compareRow(a, b))
    .map(([rowNum, rowSeats]) => ({ rowNum, seats: rowSeats.sort((a, b) => a.seatNum - b.seatNum) }))
}

/** "1열 2, 3번, 2열 5번" */
export function formatSeatLabels(seats: Pick<Seat, 'rowNum' | 'seatNum'>[]): string {
  const rows = new Map<string, number[]>()
  for (const seat of seats) {
    const numbers = rows.get(seat.rowNum) ?? []
    numbers.push(seat.seatNum)
    rows.set(seat.rowNum, numbers)
  }
  return [...rows.entries()]
    .sort(([a], [b]) => compareRow(a, b))
    .map(([rowNum, numbers]) => `${rowNum}열 ${numbers.sort((a, b) => a - b).join(', ')}번`)
    .join(', ')
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}
