import { api } from '../../../lib/api-client'
import type { CancelReservationResult } from '../types'

export const cancelReservation = (reservationId: number) =>
  api.post<CancelReservationResult>(`/reservations/${reservationId}/cancel`)