import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '../../../components/ui/button'
import { TextField } from '../../../components/ui/text-field'
import { getErrorMessage } from '../../../lib/api-error'
import { useAuth } from '../../../lib/auth'
import { loginAdmin, loginMember } from '../api/login'
import type { LoginRequest, LoginResponse } from '../types'
import './login-form.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginMode = 'member' | 'admin'

type LoginModeConfig = {
  login: (request: LoginRequest) => Promise<LoginResponse>
  showMemberLinks: boolean
}

const MODE_CONFIG: Record<LoginMode, LoginModeConfig> = {
  member: { login: loginMember, showMemberLinks: true },
  admin: { login: loginAdmin, showMemberLinks: false },
}

type LoginFormProps = {
  mode: LoginMode
  onSuccess: () => void
}

export function LoginForm({ mode, onSuccess }: LoginFormProps) {
  const config = MODE_CONFIG[mode]
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      onSuccess()
    } catch (error) {
      setFormError(getErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
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
  )
}
