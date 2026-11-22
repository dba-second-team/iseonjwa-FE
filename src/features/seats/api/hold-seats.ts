import { api } from '../../../lib/api-client'
import type { SeatHold } from '../types'

export function holdSeats(scheduleId: number, seatIds: number[]) {
  return api.post<SeatHold>(`/schedules/${scheduleId}/seats/hold`, { seatIds })
}
