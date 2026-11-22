import { api } from '../../../lib/api-client'
import type { CreatedReservation, CreateReservationRequest } from '../types'

export function createReservation(request: CreateReservationRequest) {
  return api.post<CreatedReservation>('/reservations', request)
}
