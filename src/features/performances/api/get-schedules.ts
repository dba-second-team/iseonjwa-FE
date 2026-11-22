import { api } from '../../../lib/api-client'
import type { Schedule } from '../types'

export function getSchedules(performanceId: number, options?: { signal?: AbortSignal }) {
  return api.get<Schedule[]>(`/performances/${performanceId}/schedules`, options)
}