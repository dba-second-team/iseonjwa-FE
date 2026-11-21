export type Role = 'USER' | 'ADMIN'

export type AuthUser = {
  memberId: number
  role: Role
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = AuthUser