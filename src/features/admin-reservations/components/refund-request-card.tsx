import type { AdminReservation } from '../types'
import { formatPrice, formatSchedule, formatSeats } from '../utils/format'
import './refund-request-card.css'

type RefundRequestCardProps = {
  reservation: AdminReservation
  checked: boolean
  onToggle: (reservationId: number) => void
}

export function RefundRequestCard({ reservation, checked, onToggle }: RefundRequestCardProps) {
  const inputId = `refund-request-${reservation.reservationId}`
  const refundAmount = reservation.expectedRefundAmount

  const details = [
    { label: '예매자명', value: reservation.memberName },
    { label: '관람회차', value: formatSchedule(reservation.scheduleNumber, reservation.startAt) },
    { label: '좌석', value: formatSeats(reservation.seats) },
    { label: '환불금액', value: refundAmount === null ? '-' : formatPrice(refundAmount) },
  ]

  return (
    <div className="refund-request">
      <input
        id={inputId}
        className="refund-request-checkbox"
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(reservation.reservationId)}
      />
      {/* label 안에는 dl 같은 블록 요소를 넣을 수 없어서 span 으로 표만 흉내 냄 */}
      <label htmlFor={inputId} className="refund-request-card">
        {details.map(detail => (
          <span key={detail.label} className="refund-request-row">
            <span className="refund-request-label">{detail.label}</span>
            <span className="refund-request-value">{detail.value}</span>
          </span>
        ))}
      </label>
    </div>
  )
}