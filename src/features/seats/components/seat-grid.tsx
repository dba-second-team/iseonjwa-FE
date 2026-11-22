import { cx } from '../../../utils/cx'
import type { Seat } from '../types'
import { groupByRow, isSelectable } from '../utils/seat'
import './seat-grid.css'

type SeatGridProps = {
  seats: Seat[]
  selectedIds: ReadonlySet<number>
  onToggle: (seat: Seat) => void
}

export function SeatGrid({ seats, selectedIds, onToggle }: SeatGridProps) {
  const rows = groupByRow(seats)

  return (
    <div className="seat-grid" role="group" aria-label="좌석 배치">
      {rows.map(({ rowNum, seats: rowSeats }) => (
        <div key={rowNum} className="seat-grid-row">
          <span className="seat-grid-row-label" aria-hidden="true">{rowNum}</span>
          {rowSeats.map(seat => {
            const selectable = isSelectable(seat)
            const selected = selectedIds.has(seat.seatId)
            return (
              <button
                key={seat.seatId}
                className={cx('seat-grid-seat', selected && 'is-selected')}
                type="button"
                aria-pressed={selected}
                aria-label={`${rowNum}열 ${seat.seatNum}번${selectable ? '' : ', 선택 불가'}`}
                disabled={!selectable}
                onClick={() => onToggle(seat)}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
