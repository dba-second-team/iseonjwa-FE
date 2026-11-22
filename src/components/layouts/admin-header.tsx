import { useRef, useState } from 'react'
import { SideMenu } from './side-menu'
import './admin-header.css'

export function AdminHeader({ title }: { title: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setMenuOpen(false)
    requestAnimationFrame(() => menuButton.current?.focus())
  }

  return (
    <header className="admin-header">
      <h1 className="admin-header-title">{title}</h1>
      <button
        ref={menuButton}
        className="icon-button"
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        aria-controls="site-menu"
        onClick={() => setMenuOpen(true)}
      >
        <svg width="19" height="13.5" viewBox="0 0 19 13.5" fill="none" aria-hidden="true">
          <rect width="19" height="2.5" rx="1.25" fill="currentColor" />
          <rect y="5.5" width="19" height="2.5" rx="1.25" fill="currentColor" />
          <rect y="11" width="19" height="2.5" rx="1.25" fill="currentColor" />
        </svg>
      </button>
      {menuOpen && <SideMenu onClose={closeMenu} />}
    </header>
  )
}