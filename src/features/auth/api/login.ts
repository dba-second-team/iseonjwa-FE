import { api } from '../../../lib/api-client'
import type { LoginRequest, LoginResponse } from '../types'

export const loginMember = (request: LoginRequest) => api.post<LoginResponse>('/members/login', request)

export const loginAdmin = (request: LoginRequest) => api.post<LoginResponse>('/admin/login', request)
