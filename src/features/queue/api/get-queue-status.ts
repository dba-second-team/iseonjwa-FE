import { api } from '../../../lib/api-client'
import type { QueueState } from '../types'

export function getQueueStatus(options?: { signal?: AbortSignal }) {
  return api.get<QueueState>('/queue/status', options)
}
