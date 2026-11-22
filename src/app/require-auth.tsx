import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../lib/auth'

export function RequireAuth() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
      return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  }

  return <Outlet />
}