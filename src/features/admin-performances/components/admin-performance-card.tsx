import { Link } from 'react-router'
import type { AdminPerformance } from '../types'
import { formatGenre, formatTicketCount } from '../utils/format'
import './admin-performance-card.css'

type AdminPerformanceCardProps = {
  performance: AdminPerformance
}

export function AdminPerformanceCard({ performance }: AdminPerformanceCardProps) {
  const { performanceId, title, genre, posterUrl, soldTicketCount } = performance
  const titleId = `admin-performance-${performanceId}-title`

  return (
    <article className="admin-performance-card" aria-labelledby={titleId}>
      {posterUrl ? (
        <img className="admin-performance-poster" src={posterUrl} alt={`${title} 포스터`} />
      ) : (
        <div className="admin-performance-poster admin-performance-poster-empty" aria-hidden="true" />
      )}

      <div className="admin-performance-info">
        <p className="admin-performance-genre">{formatGenre(genre)}</p>
        <h2 id={titleId} className="admin-performance-title">{title}</h2>
        <p className="admin-performance-count">현재 예매 인원 {formatTicketCount(soldTicketCount)}</p>

        <div className="admin-performance-actions">
          <Link className="admin-performance-action" to={`/admin/performances/${performanceId}/reservations`}>
            예매/취소 조회
          </Link>
          <Link
            className="admin-performance-action admin-performance-action-refund"
            to={`/admin/performances/${performanceId}/refunds`}
          >
            환불 요청 관리
          </Link>
        </div>
      </div>
    </article>
  )
}