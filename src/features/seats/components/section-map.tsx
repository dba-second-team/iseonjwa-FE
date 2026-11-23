import type { KeyboardEvent, ReactNode } from 'react'
import { cx } from '../../../utils/cx'
import type { SeatSection, SectionSummary } from '../types'
import { formatPrice } from '../utils/seat'
import './section-map.css'

type SectionMapProps = {
  summaries: Map<SeatSection, SectionSummary>
  selected: SeatSection | null
  onSelect: (section: SeatSection) => void
}

const WIDTH = 328
const HEIGHT = 448

function mirror(points: [number, number][]): [number, number][] {
  return points.map(([x, y]) => [WIDTH - x, y])
}

function toPoints(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

const LEFT_AREAS = {
  topLeft: [[0, 0], [164, 0], [164, 191], [0, 27]],
  F1: [[0, 27], [164, 191], [164, 196], [0, 196]],
  F2: [[0, 196], [164, 196], [164, 199], [0, 363]],
  S1: [[0, 363], [164, 199], [164, HEIGHT], [0, HEIGHT]],
} satisfies Record<string, [number, number][]>

const SECTIONS: { section: SeatSection; points: [number, number][]; label: [number, number] }[] = [
  { section: 'F1', points: LEFT_AREAS.F1, label: [75, 153] },
  { section: 'F2', points: LEFT_AREAS.F2, label: [75, 236] },
  { section: 'S1', points: LEFT_AREAS.S1, label: [119, 316] },
  { section: 'F3', points: mirror(LEFT_AREAS.F1), label: [253, 153] },
  { section: 'F4', points: mirror(LEFT_AREAS.F2), label: [253, 236] },
  { section: 'S2', points: mirror(LEFT_AREAS.S1), label: [209, 316] },
]

const RING_DIVIDERS: [number, number, number, number][] = [
  [0, 27, 64, 91],
  [0, 363, 64, 299],
  [WIDTH, 27, WIDTH - 64, 91],
  [WIDTH, 363, WIDTH - 64, 299],
]

export function SectionMap({ summaries, selected, onSelect }: SectionMapProps) {
  function getState(section: SeatSection) {
    const summary = summaries.get(section)
    const soldOut = !summary || summary.price === null || summary.availableCount === 0
    const label = soldOut
      ? `${section} 구역, 선택할 수 있는 좌석 없음`
      : `${section} 구역, ${formatPrice(summary.price ?? 0)}, 남은 좌석 ${summary.availableCount}석`
    return { soldOut, label }
  }

  function handleKeyDown(event: KeyboardEvent, section: SeatSection) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(section)
  }

  function renderSection(section: SeatSection, shape: ReactNode, label: [number, number]) {
    const { soldOut, label: ariaLabel } = getState(section)
    return (
      <g
        key={section}
        className={cx('section-map-section', selected === section && 'is-selected')}
        role="button"
        tabIndex={soldOut ? -1 : 0}
        aria-pressed={selected === section}
        aria-disabled={soldOut}
        aria-label={ariaLabel}
        onClick={soldOut ? undefined : () => onSelect(section)}
        onKeyDown={soldOut ? undefined : event => handleKeyDown(event, section)}
      >
        {shape}
        <text className="section-map-label" x={label[0]} y={label[1]} aria-hidden="true">
          {section}
        </text>
      </g>
    )
  }

  return (
    <div className="section-map" role="group" aria-label="공연장 구역">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="section-map-outer">
            <rect width={WIDTH} height={HEIGHT} rx={164} />
          </clipPath>
          <clipPath id="section-map-inner">
            <rect x={36} y={30} width={256} height={336} rx={128} />
          </clipPath>
        </defs>

        <g clipPath="url(#section-map-outer)">
          <rect className="section-map-ring" width={WIDTH} height={HEIGHT} rx={164} />
          {RING_DIVIDERS.map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}`} className="section-map-divider" x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <rect className="section-map-gap" x={24} y={18} width={280} height={360} rx={140} />

        <g clipPath="url(#section-map-inner)">
          <polygon className="section-map-block" points={toPoints(LEFT_AREAS.topLeft)} />
          <polygon className="section-map-block" points={toPoints(mirror(LEFT_AREAS.topLeft))} />
          {SECTIONS.map(({ section, points, label }) =>
            renderSection(section, <polygon className="section-map-shape" points={toPoints(points)} />, label),
          )}
        </g>

        <rect className="section-map-gap" x={111} y={105} width={106} height={185} rx={53} />
        <path className="section-map-stage" d="M119 181V158a45 45 0 0 1 90 0v23z" />
        <text className="section-map-label section-map-stage-label" x={164} y={151} aria-hidden="true">
          Stage
        </text>
        {renderSection('G', <path className="section-map-shape" d="M119 187h90v50a45 45 0 0 1-90 0z" />, [164, 222])}
      </svg>
    </div>
  )
}
