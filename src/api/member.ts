import type { LoginRequest, LoginResponse } from '../types/member'
import { api } from './client'

export const memberApi = {
  login: (request: LoginRequest) => api.post<LoginResponse>('/members/login', request),
}