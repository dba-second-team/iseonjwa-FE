import { useSyncExternalStore } from 'react'

/**
 * 로그인 사용자 저장소
 */

export type Role = 'USER' | 'ADMIN'

export type AuthUser = {
  memberId: number
  role: Role
  name: string
}

const STORAGE_KEY = 'iseonjwa.auth'

type Listener = () => void
const listeners = new Set<Listener>()

let cachedRaw: string | null | undefined
let cachedUser: AuthUser | null = null

export function getAuthUser(): AuthUser | null {
  const raw = readStorage()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedUser = parseAuthUser(raw)
  }
  return cachedUser
}

export function saveAuthUser(user: AuthUser): void {
  writeStorage(JSON.stringify(user))
  notify()
}

export function clearAuthUser(): void {
  writeStorage(null)
  notify()
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener)

  // 다른 탭에서 로그인, 로그아웃하면 이 탭에도 반영
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function notify() {
  listeners.forEach(listener => listener())
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStorage(value: string | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // 시크릿 모드 등에서 저장이 막히면 무시 (새로고침하면 로그아웃 상태)
  }
}

function parseAuthUser(raw: string | null): AuthUser | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    return isAuthUser(value) ? value : null
  } catch {
    return null
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.memberId === 'number' &&
    (candidate.role === 'USER' || candidate.role === 'ADMIN') &&
    typeof candidate.name === 'string'
  )
}

export function useAuth() {
  const user = useSyncExternalStore(subscribeAuth, getAuthUser, () => null)

  return {
    user,
    isLoggedIn: user !== null,
    isAdmin: user?.role === 'ADMIN',
    login: saveAuthUser,
    logout: clearAuthUser,
  }
}
