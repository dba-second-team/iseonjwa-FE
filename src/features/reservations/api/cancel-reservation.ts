import { api } from '../../../lib/api-client'

/** POST /api/reservations/{id}/cancel (API 명세 9번). 본문 없음 */
export const cancelReservation = (reservationId: number) =>
  api.post<void>(`/reservations/${reservationId}/cancel`)