import { api } from '../../../lib/api-client'
import type { MyReservationPage } from '../types'

type GetMyReservationsParams = {
  page: number
  size: number
}

export function getMyReservations({ page, size }: GetMyReservationsParams, options?: { signal?: AbortSignal }) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  return api.get<MyReservationPage>(`/members/me/reservations?${query}`, options)
}