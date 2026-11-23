import { api } from '../../../lib/api-client'

export function leaveQueue(options?: { headers?: HeadersInit; keepalive?: boolean }) {
  return api.delete<void>('/queue', options)
}
