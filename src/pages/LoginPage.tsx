import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { getErrorMessage } from '../api/ApiError'
import { memberApi } from '../api/member'
import { adminApi } from '../api/admin'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'
import { BackHeader } from '../components/common/BackHeader'
import type { LoginRequest, LoginResponse } from '../types/member'
import './LoginPage.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginMode = 'member' | 'admin'

type LoginModeConfig = {
  title: ReactNode
  login: (request: LoginRequest) => Promise<LoginResponse>
  showMemberLinks: boolean
}

const MODE_CONFIG: Record<LoginMode, LoginModeConfig> = {
  member: {
    title: <>안녕하세요!<br />아래 정보를 입력해 로그인해주세요.</>,
    login: memberApi.login,
    showMemberLinks: true,
  },
  admin: {
    title: '관리자 로그인',
    login: adminApi.login,
    showMemberLinks: false,
  },
}

type LoginPageProps = {
  mode?: LoginMode
}

export function LoginPage({ mode = 'member' }: LoginPageProps) {
  const config = MODE_CONFIG[mode]
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, isAdmin, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  if (mode === 'admin' ? isAdmin : isLoggedIn) return <Navigate to={redirectTo} replace />

  const canSubmit = email.trim() !== '' && password !== '' && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError('이메일 형식이 올바르지 않아요.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      const user = await config.login({ email: trimmedEmail, password })
      login(user)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page login-page">
      <BackHeader />

      <h1 className="login-title">{config.title}</h1>

      <form className="login-form" noValidate onSubmit={handleSubmit}>
        <div className="login-fields">
          <TextField
            label="이메일"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="이메일을 입력해 주세요."
            value={email}
            error={emailError}
            onChange={event => {
              setEmail(event.target.value)
              setEmailError('')
              setFormError('')
            }}
          />
          <TextField
            label="비밀번호"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요."
            value={password}
            onChange={event => {
              setPassword(event.target.value)
              setFormError('')
            }}
          />
        </div>

        <div className="login-bottom">
          {formError && <p className="login-error" role="alert">{formError}</p>}
          {config.showMemberLinks && (
            <p className="login-signup">
              계정이 없나요? <Link to="/signup">회원가입</Link>
            </p>
          )}
          <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
          {config.showMemberLinks && (
            <Link className="login-admin" to="/admin/login">관리자 로그인</Link>
          )}
        </div>
      </form>
    </main>
  )
}