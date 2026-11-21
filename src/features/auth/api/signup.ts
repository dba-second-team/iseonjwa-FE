import { api } from '../../../lib/api-client'
import type { CheckLoginIdResponse, SignupRequest, SignupResponse } from '../types'

export const signupMember = (request: SignupRequest) => api.post<SignupResponse>('/members', request)

export const checkLoginId = (email: string, signal?: AbortSignal) =>
  api.get<CheckLoginIdResponse>(`/members/email-check?email=${encodeURIComponent(email)}`, { signal })