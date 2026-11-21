import { cx } from '../../../utils/cx'
import type { MyReservation, ReservationStatus } from '../types'
import { formatDate, formatPrice, formatRoundAndCount } from '../utils/format'
import './reservation-card.css'

type StatusButton = { label: string; cancelable: boolean }

const STATUS_BUTTON: Record<ReservationStatus, StatusButton> = {
  CONFIRMED: { label: '취소하기', cancelable: true },
  CANCELED: { label: '취소 완료', cancelable: false },
  PENDING: { label: '결제 대기', cancelable: false },
}


/**
 * TODO: 백엔드에 paymentStatus가 생기면 주석 해제
 */
// const STATUS_BUTTON: Record<PaymentStatus, { label: string; cancelable: boolean }> = {
//   PAID: { label: '취소하기', cancelable: true },
//   CANCELED: { label: '환불 진행 중', cancelable: false },
//   REFUNDED: { label: '환불 완료', cancelable: false },
// }

type ReservationCardProps = {
  reservation: MyReservation
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  // const button: StatusButton = STATUS_BUTTON[reservation.paymentStatus]
  const button: StatusButton = STATUS_BUTTON[reservation.status]

  const details = [
    { label: '예매일', value: formatDate(reservation.reservedAt) },
    { label: '관람일', value: formatDate(reservation.startAt) },
    { label: '관람회차', value: formatRoundAndCount(reservation.scheduleRound, reservation.seats.length) },
    { label: '공연장소', value: reservation.venueName },
    { label: '총 금액', value: formatPrice(reservation.totalAmount) },
  ]

  return (
    <article className="reservation-card">
      <div className="reservation-side">
        {reservation.posterUrl ? (
          <img className="reservation-poster" src={reservation.posterUrl} alt={`${reservation.performanceTitle} 포스터`} />
        ) : (
          <div className="reservation-poster reservation-poster-empty" aria-hidden="true" />
        )}
        {button && (
          <button
            className={cx('reservation-button', button.cancelable && 'reservation-button-cancel')}
            type="button"
            disabled={!button.cancelable}
          >
            {button.label}
          </button>
        )}
      </div>

      <div className="reservation-info">
        <h2 className="reservation-title">{reservation.performanceTitle}</h2>
        <dl className="reservation-details">
          {details.map(detail => (
            <div key={detail.label} className="reservation-detail">
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}