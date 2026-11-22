import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../lib/auth'

export function RequireAdmin() {
  const { isAdmin } = useAuth()
  const location = useLocation()

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  }

  return <Outlet />
}