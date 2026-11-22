import { Link } from 'react-router'
import type { PerformanceSummary } from '../types'
import { formatPeriod, formatPriceRange } from '../utils/format'
import './performance-card.css'

export function PerformanceCard({ performance }: { performance: PerformanceSummary }) {
  const { performanceId, title, posterUrl, startDate, endDate, minPrice, maxPrice } = performance
  const titleId = `performance-${performanceId}-title`

  return (
    <article className="performance-card" aria-labelledby={titleId}>
      <Link className="performance-card-link" to={`/performances/${performanceId}`}>
        {posterUrl ? (
          <img className="performance-poster" src={posterUrl} alt={`${title} 공연 포스터`} width="163" height="217" />
        ) : (
          <div className="performance-poster performance-poster-empty" aria-hidden="true" />
        )}
        <h2 id={titleId} className="performance-title">{title}</h2>
        <p className="performance-date">{formatPeriod(startDate, endDate)}</p>
        <p className="performance-price">{formatPriceRange(minPrice, maxPrice)}</p>
      </Link>
    </article>
  )
}