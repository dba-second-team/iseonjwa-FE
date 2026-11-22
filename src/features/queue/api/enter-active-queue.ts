import { api } from '../../../lib/api-client'
import type { ActiveAdmission } from '../types'

export function enterActiveQueue(performanceId: number, options?: { signal?: AbortSignal }) {
  return api.post<ActiveAdmission>('/queue/active', { performanceId }, options)
}
