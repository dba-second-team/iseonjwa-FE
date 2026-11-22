import { api } from '../../../lib/api-client'
import type { PerformanceDetail } from '../types'

export function getPerformance(performanceId: number, options?: { signal?: AbortSignal }) {
  return api.get<PerformanceDetail>(`/performances/${performanceId}`, options)
}