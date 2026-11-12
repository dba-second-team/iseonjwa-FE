import { useEffect, useRef } from 'react'
import profile from '../assets/reference/profile.svg'

export function SideMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

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
        <span className="menu-login-label">로그인하기</span>
      </div>
    </dialog>
  )
}
