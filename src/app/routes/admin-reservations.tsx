import { useParams, useSearchParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { AdminReservationCard } from '../../features/admin-reservations/components/admin-reservation-card'
import { StatusTabs } from '../../features/admin-reservations/components/status-tabs'
import { usePerformanceReservations } from '../../features/admin-reservations/hooks/use-performance-reservations'
import type { PaymentStatus } from '../../features/admin-reservations/types'
import { parseStatus, STATUS_PANEL_ID, statusTabId } from '../../features/admin-reservations/utils/status'
import './admin-reservations.css'

const EMPTY_MESSAGE: Record<PaymentStatus, string> = {
  PAID: '예매 완료된 내역이 없어요.',
  CANCELED: '취소 완료된 내역이 없어요.',
  REFUNDED: '환불 완료된 내역이 없어요.',
}

export function AdminReservationsRoute() {
  const { performanceId: rawId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = parseStatus(searchParams.get('status'))
  const performanceId = Number(rawId)
  const isValidId = Number.isInteger(performanceId) && performanceId > 0

  function changeStatus(next: PaymentStatus) {
    setSearchParams({ status: next }, { replace: true })
  }

  return (
    <main className="page admin-reservations-page">
      <BackHeader title="예매/취소 조회" fallbackTo="/admin/performances" />
      <StatusTabs value={status} onChange={changeStatus} />

      <section id={STATUS_PANEL_ID} role="tabpanel" aria-labelledby={statusTabId(status)}>
        {isValidId ? (
          <ReservationList key={`${performanceId}-${status}`} performanceId={performanceId} status={status} />
        ) : (
          <p className="admin-reservations-message" role="alert">잘못된 공연 주소예요.</p>
        )}
      </section>
    </main>
  )
}

type ReservationListProps = {
  performanceId: number
  status: PaymentStatus
}

function ReservationList({ performanceId, status }: ReservationListProps) {
  const { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore } =
    usePerformanceReservations(performanceId, status)

  return (
    <>
      {state.status === 'loading' && <p className="admin-reservations-message">내역을 불러오는 중이에요.</p>}

      {state.status === 'error' && (
        <div className="admin-reservations-message" role="alert">
          <p>{state.message}</p>
          <button className="admin-reservations-retry" type="button" onClick={reload}>다시 시도</button>
        </div>
      )}

      {state.status === 'success' && state.reservations.length === 0 && (
        <p className="admin-reservations-message">{EMPTY_MESSAGE[status]}</p>
      )}

      {state.status === 'success' && state.reservations.length > 0 && (
        <ul className="admin-reservations-list">
          {state.reservations.map(reservation => (
            <li key={reservation.reservationId}>
              <AdminReservationCard reservation={reservation} />
            </li>
          ))}
        </ul>
      )}

      {loadMoreError && <p className="admin-reservations-more-error" role="alert">{loadMoreError}</p>}

      {hasMore && (
        <button
          className="admin-reservations-more"
          type="button"
          disabled={isLoadingMore}
          aria-busy={isLoadingMore || undefined}
          onClick={loadMore}
        >
          {isLoadingMore ? '불러오는 중' : '더 보기'}
        </button>
      )}
    </>
  )
}