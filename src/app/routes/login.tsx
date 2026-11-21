import type { ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { BackHeader } from '../../components/ui/back-header'
import { LoginForm, type LoginMode } from '../../features/auth/components/login-form'
import { useAuth } from '../../lib/auth'
import './login.css'

const TITLES: Record<LoginMode, ReactNode> = {
  member: <>안녕하세요!<br />아래 정보를 입력해 로그인해주세요.</>,
  admin: '관리자 로그인',
}

type LoginRouteProps = {
  mode?: LoginMode
}

export function LoginRoute({ mode = 'member' }: LoginRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, isAdmin } = useAuth()

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  if (mode === 'admin' ? isAdmin : isLoggedIn) return <Navigate to={redirectTo} replace />

  return (
    <main className="page login-page">
      <BackHeader />
      <h1 className="login-title">{TITLES[mode]}</h1>
      <LoginForm mode={mode} onSuccess={() => navigate(redirectTo, { replace: true })} />
    </main>
  )
}
