import type { AdminReservation } from '../types'
import { formatDate, formatRoundAndCount, getAmountDetail } from '../utils/format'
import './admin-reservation-card.css'

type AdminReservationCardProps = {
  reservation: AdminReservation
}

export function AdminReservationCard({ reservation }: AdminReservationCardProps) {
  const details = [
    { label: '예매자명', value: reservation.memberName },
    { label: '관람회차', value: formatRoundAndCount(reservation.scheduleNumber, reservation.ticketCount) },
    { label: '예매일자', value: formatDate(reservation.reservedAt) },
    getAmountDetail(reservation),
  ]

  return (
    <article className="admin-reservation-card">
      <dl className="admin-reservation-details">
        {details.map(detail => (
          <div key={detail.label} className="admin-reservation-detail">
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}