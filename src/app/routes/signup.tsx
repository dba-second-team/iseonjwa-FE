import { Navigate, useNavigate } from 'react-router'
import { BackHeader } from '../../components/ui/back-header'
import { SignupForm } from '../../features/auth/components/signup-form'
import { useAuth } from '../../lib/auth'
import './signup.css'

export function SignupRoute() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  if (isLoggedIn) return <Navigate to="/" replace />

  return (
    <main className="page signup-page">
      <BackHeader fallbackTo="/login" />
      <h1 className="signup-title">회원가입을 위해<br />아래 정보를 입력해 주세요</h1>
      <SignupForm onSuccess={email => navigate('/login', { replace: true, state: { signedUpEmail: email } })} />
    </main>
  )
}