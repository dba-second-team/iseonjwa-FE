import { api } from '../../../lib/api-client'
import type { AdminRefundResult } from '../types'

export function completeRefunds(performanceId: number, reservationIds: number[]) {
  return api.post<AdminRefundResult>(`/admin/performances/${performanceId}/refunds`, { reservationIds })
}