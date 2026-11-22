import { useEffect, useId, useRef } from 'react'
import './reservation-review-dialog.css'

type ReservationReviewDialogProps = {
  performanceTitle: string
  dateTime: string
  price: string
  bookerName: string
  confirmLabel: string
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

/** "예매하신 내역이 맞나요?" 확인 다이얼로그 (예매 단계와 결제 단계에서 버튼 문구만 바꿔 씀) */
export function ReservationReviewDialog({
  performanceTitle,
  dateTime,
  price,
  bookerName,
  confirmLabel,
  loading = false,
  error,
  onConfirm,
  onClose,
}: ReservationReviewDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function close() {
    if (!loading) onClose()
  }

  return (
    <dialog
      ref={ref}
      className="review-dialog"
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault()
        close()
      }}
    >
      <h2 id={titleId} className="review-dialog-title">예매하신 내역이 맞나요?</h2>

      <div className="review-dialog-card">
        <p className="review-dialog-performance">{performanceTitle}</p>
        <dl className="review-dialog-list">
          <div className="review-dialog-row">
            <dt>날짜</dt>
            <dd>{dateTime}</dd>
          </div>
          <div className="review-dialog-row">
            <dt>가격</dt>
            <dd>{price}</dd>
          </div>
          <div className="review-dialog-row">
            <dt>예매자</dt>
            <dd>{bookerName}</dd>
          </div>
        </dl>
      </div>

      {error && <p className="review-dialog-error" role="alert">{error}</p>}

      <div className="review-dialog-actions">
        <button className="review-dialog-button" type="button" disabled={loading} onClick={close}>
          다시 할게요
        </button>
        <button
          className="review-dialog-button review-dialog-confirm"
          type="button"
          disabled={loading}
          aria-busy={loading || undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
