import { BackHeader } from '../../components/ui/back-header'
import { AdminPerformanceCard } from '../../features/admin-performances/components/admin-performance-card'
import { useAdminPerformances } from '../../features/admin-performances/hooks/use-admin-performances'
import './admin-performances.css'

export function AdminPerformancesRoute() {
  const { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore } = useAdminPerformances()

  return (
    <main className="page admin-performances-page">
      <BackHeader title="공연 관리하기" />

      {state.status === 'loading' && <p className="admin-performances-message">공연 목록을 불러오는 중이에요.</p>}

      {state.status === 'error' && (
        <div className="admin-performances-message" role="alert">
          <p>{state.message}</p>
          <button className="admin-performances-retry" type="button" onClick={reload}>다시 시도</button>
        </div>
      )}

      {state.status === 'success' && state.performances.length === 0 && (
        <p className="admin-performances-message">아직 등록한 공연이 없어요.</p>
      )}

      {state.status === 'success' && state.performances.length > 0 && (
        <ul className="admin-performances-list">
          {state.performances.map(performance => (
            <li key={performance.performanceId}>
              <AdminPerformanceCard performance={performance} />
            </li>
          ))}
        </ul>
      )}

      {loadMoreError && <p className="admin-performances-more-error" role="alert">{loadMoreError}</p>}

      {hasMore && (
        <button
          className="admin-performances-more"
          type="button"
          disabled={isLoadingMore}
          aria-busy={isLoadingMore || undefined}
          onClick={loadMore}
        >
          {isLoadingMore ? '불러오는 중' : '더 보기'}
        </button>
      )}
    </main>
  )
}