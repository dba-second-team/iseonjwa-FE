import { useRef, useState } from 'react'
import ticket from '../../assets/frame-1/ticket.svg'
import { SideMenu } from '../../components/layouts/side-menu'
import { PerformanceCard } from '../../features/performances/components/performance-card'
import { usePerformances } from '../../features/performances/hooks/use-performances'
import { Navigate } from 'react-router'
import { useAuth } from '../../lib/auth'
import './home.css'

export function HomeRoute() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { isAdmin } = useAuth()
  const { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore } = usePerformances()

  function closeMenu() {
    setMenuOpen(false)
    requestAnimationFrame(() => menuButton.current?.focus())
  }

  if (isAdmin) return <Navigate to="/admin/performances" replace />

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
        <h1 id="hero-title" className="hero-title">기다리던 콘서트,<br />내 티켓으로</h1>
        <p className="hero-description">취향에 맞는 공연을 만나보세요</p>
      </section>
      <section className="performance-section" aria-label="공연 목록" aria-busy={state.status === 'loading' || undefined}>
        {state.status === 'loading' && <p className="performance-message">공연 목록을 불러오는 중이에요.</p>}

        {state.status === 'error' && (
          <div className="performance-message" role="alert">
            <p>{state.message}</p>
            <button className="performance-retry" type="button" onClick={reload}>다시 시도</button>
          </div>
        )}

        {state.status === 'success' && state.performances.length === 0 && (
          <p className="performance-message">아직 예매할 수 있는 공연이 없어요.</p>
        )}

        {state.status === 'success' && state.performances.length > 0 && (
          <ul className="performance-list">
            {state.performances.map(performance => (
              <li key={performance.performanceId}>
                <PerformanceCard performance={performance} />
              </li>
            ))}
          </ul>
        )}

        {loadMoreError && <p className="performance-more-error" role="alert">{loadMoreError}</p>}

        {hasMore && (
          <button
            className="performance-more"
            type="button"
            disabled={isLoadingMore}
            aria-busy={isLoadingMore || undefined}
            onClick={loadMore}
          >
            {isLoadingMore ? '불러오는 중' : '더 보기'}
          </button>
        )}
      </section>
      {menuOpen && <SideMenu onClose={closeMenu} />}
    </main>
  )
}