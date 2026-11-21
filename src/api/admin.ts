import type { LoginRequest, LoginResponse } from '../types/member'
import { api } from './client'

export const adminApi = {
  login: (request: LoginRequest) => api.post<LoginResponse>('/admin/login', request),
}