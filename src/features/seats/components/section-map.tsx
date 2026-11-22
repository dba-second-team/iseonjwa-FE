import { cx } from '../../../utils/cx'
import type { SeatSection, SectionSummary } from '../types'
import { formatPrice } from '../utils/seat'
import './section-map.css'

type SectionMapProps = {
  summaries: Map<SeatSection, SectionSummary>
  selected: SeatSection | null
  onSelect: (section: SeatSection) => void
}

export function SectionMap({ summaries, selected, onSelect }: SectionMapProps) {
  function renderSection(section: SeatSection) {
    const summary = summaries.get(section)
    const soldOut = !summary || summary.price === null || summary.availableCount === 0
    const label = soldOut
      ? `${section} 구역, 선택할 수 있는 좌석 없음`
      : `${section} 구역, ${formatPrice(summary.price ?? 0)}, 남은 좌석 ${summary.availableCount}석`

    return (
      <button
        key={section}
        className={cx('section-map-section', `section-map-${section.toLowerCase()}`)}
        type="button"
        aria-pressed={selected === section}
        aria-label={label}
        disabled={soldOut}
        onClick={() => onSelect(section)}
      >
        {section}
      </button>
    )
  }

  return (
    <div className="section-map" role="group" aria-label="공연장 구역">
      <div className="section-map-floor">
        <span className="section-map-block section-map-top-left" aria-hidden="true" />
        <span className="section-map-block section-map-top-right" aria-hidden="true" />
        {renderSection('F1')}
        <span className="section-map-stage">Stage</span>
        {renderSection('F3')}
        {renderSection('F2')}
        {renderSection('G')}
        {renderSection('F4')}
        {renderSection('S1')}
        {renderSection('S2')}
      </div>
    </div>
  )
}
