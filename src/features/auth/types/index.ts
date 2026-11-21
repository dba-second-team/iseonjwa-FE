import type { AuthUser } from '../../../lib/auth'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = AuthUser

export type SignupRequest = {
  name: string
  email: string
  password: string
  phone: string
}

export type SignupResponse = {
  memberId: number
  email: string
  name: string
}

export type CheckLoginIdResponse = {
  available: boolean
}