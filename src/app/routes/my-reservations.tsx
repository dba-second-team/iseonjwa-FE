import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { getErrorMessage } from '../../lib/api-error'
import { cancelReservation } from '../../features/reservations/api/cancel-reservation'
import { ReservationCard } from '../../features/reservations/components/reservation-card'
import { useMyReservations } from '../../features/reservations/hooks/use-my-reservations'
import './my-reservations.css'

export function MyReservationsRoute() {
  const { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore, markCanceled } = useMyReservations()

  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  function openCancelDialog(reservationId: number) {
    setCancelError(null)
    setCancelTargetId(reservationId)
  }

  async function confirmCancel() {
    if (cancelTargetId === null || isCanceling) return
    setIsCanceling(true)
    setCancelError(null)
    try {
      await cancelReservation(cancelTargetId)
      markCanceled(cancelTargetId)
      setCancelTargetId(null)
    } catch (error) {
      setCancelError(getErrorMessage(error))
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <main className="page my-reservations-page">
      <BackHeader title="나의 예매 내역" />

      {state.status === 'loading' && <p className="my-reservations-message">예매 내역을 불러오는 중이에요.</p>}

      {state.status === 'error' && (
        <div className="my-reservations-message" role="alert">
          <p>{state.message}</p>
          <button className="my-reservations-retry" type="button" onClick={reload}>다시 시도</button>
        </div>
      )}

      {state.status === 'success' && state.reservations.length === 0 && (
        <p className="my-reservations-message">아직 예매한 공연이 없어요.</p>
      )}

      {state.status === 'success' && state.reservations.length > 0 && (
        <ul className="my-reservations-list">
          {state.reservations.map(reservation => (
            <li key={reservation.reservationId}>
              <ReservationCard reservation={reservation} onCancelClick={openCancelDialog} />
            </li>
          ))}
        </ul>
      )}

      {loadMoreError && <p className="my-reservations-more-error" role="alert">{loadMoreError}</p>}

      {hasMore && (
        <button
          className="my-reservations-more"
          type="button"
          disabled={isLoadingMore}
          aria-busy={isLoadingMore || undefined}
          onClick={loadMore}
        >
          {isLoadingMore ? '불러오는 중' : '더 보기'}
        </button>
      )}

      {cancelTargetId !== null && (
        <ConfirmDialog
          title="해당 공연을 취소하시겠어요?"
          description="취소한 공연은 복구되지 않아요"
          confirmLabel="취소할게요"
          loading={isCanceling}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={() => setCancelTargetId(null)}
        />
      )}
    </main>
  )
}