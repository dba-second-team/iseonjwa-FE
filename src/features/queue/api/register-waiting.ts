import { api } from '../../../lib/api-client'
import type { WaitingRegistration } from '../types'

export function registerWaiting(performanceId: number, options?: { signal?: AbortSignal }) {
  return api.post<WaitingRegistration>('/queue/waiting', { performanceId }, options)
}
