import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import profile from '../../assets/reference/profile.svg'
import { useAuth } from '../../lib/auth'
import './side-menu.css'

export function SideMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()
const { user, isAdmin, logout } = useAuth()

  const links = isAdmin
    ? [
        { to: '/admin/performances', label: '공연 관리하기' },
        { to: '/admin/performances/new', label: '공연 등록하기' },
      ]
    : [{ to: '/my/reservations', label: '나의 공연 예매내역' }]

  function handleLogout() {
    logout()
    onClose()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog
      ref={ref}
      id="site-menu"
      className="side-menu"
      aria-label="전체 메뉴"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => {
        if (event.target !== ref.current) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}
    >
      <button className="icon-button menu-close" type="button" aria-label="메뉴 닫기" onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <div className="menu-profile">
        <img src={profile} width="46" height="46" alt="" />
        {user ? (
          <span className="menu-user-name">{user.name}</span>
        ) : (
          <Link className="menu-login-label" to="/login">로그인하기</Link>
        )}
      </div>
      {user && (
        <>
          <nav className="menu-links" aria-label="내 메뉴">
            {links.map(link => (
              <Link key={link.to} className="menu-link" to={link.to} onClick={onClose}>
                {link.label}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            ))}
          </nav>
          <button className="menu-logout" type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </>
      )}
    </dialog>
  )
}
