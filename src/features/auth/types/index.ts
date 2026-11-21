import type { AuthUser } from '../../../lib/auth'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = AuthUser
