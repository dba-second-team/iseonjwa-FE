import { api } from '../../../lib/api-client'
import type { ScheduleSeats } from '../types'

export function getScheduleSeats(scheduleId: number, options?: { signal?: AbortSignal }) {
  return api.get<ScheduleSeats>(`/schedules/${scheduleId}/seats`, options)
}
