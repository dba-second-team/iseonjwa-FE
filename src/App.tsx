import { useRef, useState } from 'react'
import ticket from './assets/frame-1/ticket.svg'
import { PerformanceCard } from './components/PerformanceCard'
import { SideMenu } from './components/SideMenu'
import { performances } from './data/performances'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setMenuOpen(false)
    requestAnimationFrame(() => menuButton.current?.focus())
  }

  return (
    <main className="page home-page">
      <section className="ticket-header" aria-labelledby="hero-title">
        <div className="ticket-header-glow" aria-hidden="true" />
        <img className="ticket-illustration" src={ticket} width="390" height="299" alt="" />
        <button
          ref={menuButton}
          className="menu-button"
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
        <h1 id="hero-title" className="hero-title">기다리던 콘서트,<br />내 티켓으로.</h1>
        <p className="hero-description">취향에 맞는 공연을 만나보세요.</p>
      </section>
      <section className="performance-list" aria-label="공연 목록">
        {performances.map(performance => <PerformanceCard key={performance.id} performance={performance} />)}
      </section>
      {menuOpen && <SideMenu onClose={closeMenu} />}
    </main>
  )
}

export default App
