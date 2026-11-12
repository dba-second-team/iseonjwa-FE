import type { Performance } from '../data/performances'

export function PerformanceCard({ performance }: { performance: Performance }) {
  return (
    <article className="performance-card" aria-labelledby={`${performance.id}-title`}>
      <img className="performance-poster" src={performance.poster} alt={`${performance.cardTitle} 공연 포스터`} width="163" height="217" />
      <h2 id={`${performance.id}-title`} className="performance-title">{performance.cardTitle}</h2>
      <p className="performance-date">{performance.cardDate}</p>
      <p className="performance-price">{performance.cardPrice}</p>
    </article>
  )
}
