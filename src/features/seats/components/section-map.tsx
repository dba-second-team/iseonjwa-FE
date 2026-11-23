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

type Point = [number, number]

const VIEW_BOX = '34 216 327 425'
const MIRROR_X = 395

function mirror(points: Point[]): Point[] {
  return points.map(([x, y]) => [MIRROR_X - x, y])
}

function toPoints(points: Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

const LEFT_AREAS = {
  topLeft: [[0, 200], [197.5, 200], [197.5, 407], [0, 235.8]],
  F1: [[0, 235.8], [197.5, 407], [197.5, 427], [0, 427]],
  F2: [[0, 427], [197.5, 427], [197.5, 451.8], [0, 616.3]],
  S1: [[0, 616.3], [197.5, 451.8], [197.5, 660], [0, 660]],
} satisfies Record<string, Point[]>

const SECTIONS: { section: SeatSection; points: Point[]; label: Point }[] = [
  { section: 'F1', points: LEFT_AREAS.F1, label: [107, 392.5] },
  { section: 'F2', points: LEFT_AREAS.F2, label: [108, 476] },
  { section: 'S1', points: LEFT_AREAS.S1, label: [150, 557] },
  { section: 'F3', points: mirror(LEFT_AREAS.F1), label: [289.5, 392.5] },
  { section: 'F4', points: mirror(LEFT_AREAS.F2), label: [289, 476] },
  { section: 'S2', points: mirror(LEFT_AREAS.S1), label: [243.5, 557] },
]

const RING_DIVIDERS: [Point, Point][] = [
  [[20, 253.1], [100, 322.5]],
  [[20, 599.6], [100, 533]],
  [[MIRROR_X - 20, 253.1], [MIRROR_X - 100, 322.5]],
  [[MIRROR_X - 20, 599.6], [MIRROR_X - 100, 533]],
]

export function SectionMap({ summaries, selected, onSelect }: SectionMapProps) {
  function handleKeyDown(event: KeyboardEvent, section: SeatSection) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(section)
  }

  function renderSection(section: SeatSection, shape: ReactNode, [labelX, labelY]: Point) {
    const summary = summaries.get(section)
    const soldOut = !summary || summary.price === null || summary.availableCount === 0
    const ariaLabel = soldOut
      ? `${section} 구역, 선택할 수 있는 좌석 없음`
      : `${section} 구역, ${formatPrice(summary.price ?? 0)}, 남은 좌석 ${summary.availableCount}석`

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
        <text className="section-map-label" x={labelX} y={labelY} aria-hidden="true">
          {section}
        </text>
      </g>
    )
  }

  return (
    <div className="section-map" role="group" aria-label="공연장 구역">
      <svg viewBox={VIEW_BOX} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="section-map-outer">
            <rect x={34} y={216} width={327} height={424} rx={163.5} ry={170} />
          </clipPath>
          <clipPath id="section-map-inner">
            <rect x={69.5} y={264} width={256} height={329} rx={128} />
          </clipPath>
        </defs>

        <g clipPath="url(#section-map-outer)">
          <rect className="section-map-ring" x={34} y={216} width={327} height={424} rx={163.5} ry={170} />
          {RING_DIVIDERS.map(([[x1, y1], [x2, y2]]) => (
            <line key={`${x1}-${y1}`} className="section-map-divider" x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <rect className="section-map-gap" x={56} y={245} width={283} height={366} rx={141.5} ry={145} />

        <g clipPath="url(#section-map-inner)">
          <polygon className="section-map-block" points={toPoints(LEFT_AREAS.topLeft)} />
          <polygon className="section-map-block" points={toPoints(mirror(LEFT_AREAS.topLeft))} />
          {SECTIONS.map(({ section, points, label }) =>
            renderSection(section, <polygon className="section-map-shape" points={toPoints(points)} />, label),
          )}
        </g>

        <rect className="section-map-gap" x={140} y={333} width={115} height={188} rx={57.5} />
        <path className="section-map-stage" d="M149.5 413V390a48 48 0 0 1 96 0v23z" />
        <text className="section-map-label section-map-stage-label" x={197} y={389} aria-hidden="true">
          Stage
        </text>
        {renderSection('G', <path className="section-map-shape" d="M149.5 419h96v45a48 48 0 0 1-96 0z" />, [197.5, 465])}
      </svg>
    </div>
  )
}
