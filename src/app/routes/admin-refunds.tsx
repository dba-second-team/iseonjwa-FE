import { useState } from 'react'
import { useParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { Button } from '../../components/ui/button'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { completeRefunds } from '../../features/admin-reservations/api/complete-refunds'
import { RefundRequestCard } from '../../features/admin-reservations/components/refund-request-card'
import { usePerformanceReservations } from '../../features/admin-reservations/hooks/use-performance-reservations'
import { ApiError, getErrorMessage } from '../../lib/api-error'
import './admin-refunds.css'

const MAX_REFUND_COUNT = 100

const STALE_LIST_ERRORS = new Set(['REFUND_NOT_PENDING', 'RESERVATION_NOT_FOUND'])

export function AdminRefundsRoute() {
  const { performanceId: rawId } = useParams()
  const performanceId = Number(rawId)
  const isValidId = Number.isInteger(performanceId) && performanceId > 0

  return (
    <main className="page admin-refunds-page">
      <BackHeader title="환불 요청 관리" fallbackTo="/admin/performances" />
      {isValidId ? (
        <RefundRequestList key={performanceId} performanceId={performanceId} />
      ) : (
        <p className="admin-refunds-message" role="alert">잘못된 공연 주소예요.</p>
      )}
    </main>
  )
}

function RefundRequestList({ performanceId }: { performanceId: number }) {
  const { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore } =
    usePerformanceReservations(performanceId, 'CANCELED')

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const selectedCount = selectedIds.size
  const isOverLimit = selectedCount > MAX_REFUND_COUNT

  function toggle(reservationId: number) {
    setNotice(null)
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(reservationId)) next.delete(reservationId)
      else next.add(reservationId)
      return next
    })
  }

  function openDialog() {
    setSubmitError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    if (!isSubmitting) setIsDialogOpen(false)
  }

  function refreshList(message: string) {
    setIsDialogOpen(false)
    setSelectedIds(new Set())
    setNotice(message)
    reload()
  }

  async function submit() {
    if (isSubmitting || selectedCount === 0 || isOverLimit) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await completeRefunds(performanceId, [...selectedIds])
      refreshList(`${result.items.length}건을 환불 처리했어요.`)
    } catch (error) {
      if (error instanceof ApiError && STALE_LIST_ERRORS.has(error.code)) {
        refreshList('이미 처리된 예매가 있어 목록을 다시 불러왔어요. 다시 선택해 주세요.')
      } else {
        setSubmitError(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="admin-refunds-content" aria-label="환불 요청 목록">
        {notice && <p className="admin-refunds-notice" role="status">{notice}</p>}

        {state.status === 'loading' && <p className="admin-refunds-message">환불 요청을 불러오는 중이에요.</p>}

        {state.status === 'error' && (
          <div className="admin-refunds-message" role="alert">
            <p>{state.message}</p>
            <button className="admin-refunds-retry" type="button" onClick={reload}>다시 시도</button>
          </div>
        )}

        {state.status === 'success' && state.reservations.length === 0 && (
          <p className="admin-refunds-message">환불 요청이 없어요.</p>
        )}

        {state.status === 'success' && state.reservations.length > 0 && (
          <ul className="admin-refunds-list">
            {state.reservations.map(reservation => (
              <li key={reservation.reservationId}>
                <RefundRequestCard
                  reservation={reservation}
                  checked={selectedIds.has(reservation.reservationId)}
                  onToggle={toggle}
                />
              </li>
            ))}
          </ul>
        )}

        {loadMoreError && <p className="admin-refunds-more-error" role="alert">{loadMoreError}</p>}

        {hasMore && (
          <button
            className="admin-refunds-more"
            type="button"
            disabled={isLoadingMore}
            aria-busy={isLoadingMore || undefined}
            onClick={loadMore}
          >
            {isLoadingMore ? '불러오는 중' : '더 보기'}
          </button>
        )}
      </section>

      <div className="admin-refunds-footer">
        {isOverLimit && (
          <p className="admin-refunds-limit" role="alert">
            한 번에 {MAX_REFUND_COUNT}건까지 환불할 수 있어요.
          </p>
        )}
        <Button className="admin-refunds-submit" disabled={selectedCount === 0 || isOverLimit} onClick={openDialog}>
          환불 처리하기
        </Button>
      </div>

      {isDialogOpen && (
        <ConfirmDialog
          title={selectedCount === 1 ? '이 예매를 취소하고 환불할까요?' : `예매 ${selectedCount}건을 취소하고 환불할까요?`}
          description="환불된 예매자의 예매 내역은 취소되며, 환불 처리한 내역은 복구되지 않아요."
          confirmLabel="환불 처리하기"
          loading={isSubmitting}
          error={submitError}
          onConfirm={submit}
          onClose={closeDialog}
        />
      )}
    </>
  )
}