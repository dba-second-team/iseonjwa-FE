import { useLocation, useNavigate } from 'react-router'
import './back-header.css'

type BackHeaderProps = {
  fallbackTo?: string
  title?: string
}

export function BackHeader({ fallbackTo = '/', title }: BackHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function goBack() {
    if (location.key === 'default') navigate(fallbackTo, { replace: true })
    else navigate(-1)
  }

  return (
    <header className="back-header">
      <button className="back-header-button" type="button" aria-label="뒤로 가기" onClick={goBack}>
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
          <path d="M9 1 1 9l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {title && <h1 className="back-header-title">{title}</h1>}
    </header>
  )
}