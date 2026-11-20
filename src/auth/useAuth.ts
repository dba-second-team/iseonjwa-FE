import { useSyncExternalStore } from 'react'
import { clearAuthUser, getAuthUser, saveAuthUser, subscribeAuth } from './authStore'

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