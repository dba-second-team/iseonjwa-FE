import { api } from '../../../lib/api-client'
import type { PaymentStatus } from '../../reservations/types'
import type { AdminReservationPage } from '../types'

type GetPerformanceReservationsParams = {
  performanceId: number
  status: PaymentStatus
  page: number
  size: number
}

export function getPerformanceReservations(
  { performanceId, status, page, size }: GetPerformanceReservationsParams,
  options?: { signal?: AbortSignal },
) {
  const query = new URLSearchParams({ status, page: String(page), size: String(size) })
  return api.get<AdminReservationPage>(`/admin/performances/${performanceId}/reservations?${query}`, options)
}