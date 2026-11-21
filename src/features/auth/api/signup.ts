import { api } from '../../../lib/api-client'
import type { SignupRequest, SignupResponse } from '../types'

export const signupMember = (request: SignupRequest) => api.post<SignupResponse>('/members', request)