export type Role = 'USER' | 'ADMIN'

export type AuthUser = {
  memberId: number
  role: Role
  name: string
}