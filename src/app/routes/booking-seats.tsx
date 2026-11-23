import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { SelectionBar } from '../../components/layouts/selection-bar'
import { paths } from '../../config/paths'
import { holdSeats } from '../../features/seats/api/hold-seats'
import { SeatGrid } from '../../features/seats/components/seat-grid'
import { useSeatMap } from '../../features/seats/hooks/use-seat-map'
import type { HeldSeatsState, Seat, SeatSection } from '../../features/seats/types'
import { formatPrice, formatSeatLabels, isSeatSection, isSelectable, sumPrices } from '../../features/seats/utils/seat'
import { ApiError, getErrorMessage } from '../../lib/api-error'
import { parseId } from '../../utils/parse-id'
import './booking-select.css'

export function BookingSeatsRoute() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const performanceId = parseId(params.performanceId)
  const scheduleId = parseId(params.scheduleId)
  const section = searchParams.get('section')

  if (performanceId === null || scheduleId === null) return <Navigate to={paths.home()} replace />
  if (!isSeatSection(section)) return <Navigate to={paths.booking.sections(performanceId, scheduleId)} replace />
  return <BookingSeats key={section} performanceId={performanceId} scheduleId={scheduleId} section={section} />
}

type BookingSeatsProps = {
  performanceId: number
  scheduleId: number
  section: SeatSection
}

function BookingSeats({ performanceId, scheduleId, section }: BookingSeatsProps) {
  const navigate = useNavigate()
  const { state, reload } = useSeatMap(performanceId, scheduleId)
  // 아직 고르지 않았으면 null. 이때는 이미 선점해 둔 좌석을 선택한 상태로 보여 준다
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number> | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const header = <BackHeader title="예매하기" fallbackTo={paths.booking.sections(performanceId, scheduleId)} />

  if (state.status === 'loading') {
    return (
      <main className="page booking-select-page">
        {header}
        <p className="booking-select-message">좌석 정보를 불러오는 중이에요.</p>
      </main>
    )
  }

  if (state.status !== 'success') {
    return (
      <main className="page booking-select-page">
        {header}
        <div className="booking-select-message" role="alert">
          <p>{state.status === 'not-found' ? '존재하지 않는 공연 또는 회차예요.' : state.message}</p>
          {state.status === 'error' && (
            <button className="booking-select-retry" type="button" onClick={reload}>다시 시도</button>
          )}
        </div>
      </main>
    )
  }

  const limit = state.performance.maxTicketsPerMember
  const sectionSeats = state.seats.filter(seat => seat.section === section)
  // 다시 불러온 좌석에서 선택할 수 없게 된 좌석은 선택에서 뺌
  const selectedSeats = sectionSeats.filter(seat =>
    isSelectable(seat) && (selectedIds === null ? seat.heldByMe : selectedIds.has(seat.seatId)))
  const totalPrice = sumPrices(selectedSeats)

  function toggle(seat: Seat) {
    setMessage(null)
    const next = new Set(selectedSeats.map(selectedSeat => selectedSeat.seatId))
    if (next.has(seat.seatId)) {
      next.delete(seat.seatId)
    } else {
      if (next.size >= limit) {
        setMessage(`1인 최대 ${limit}매까지 선택할 수 있어요.`)
        return
      }
      next.add(seat.seatId)
    }
    setSelectedIds(next)
  }

  async function submit() {
    if (selectedSeats.length === 0 || submitting) return
    setSubmitting(true)
    setMessage(null)
    try {
      // 서버는 이 회차에서 내가 선점한 좌석을 요청한 좌석으로 교체하므로 선택한 좌석을 모두 보냄
      await holdSeats(scheduleId, selectedSeats.map(seat => seat.seatId))

      const nextState: HeldSeatsState = { seats: selectedSeats }
      navigate(paths.booking.confirm(performanceId, scheduleId), { state: nextState })
    } catch (error) {
      setSubmitting(false)
      if (error instanceof ApiError && error.code === 'SEAT_UNAVAILABLE') {
        setMessage('다른 분이 먼저 선택한 좌석이 있어요. 좌석을 다시 골라 주세요.')
        setSelectedIds(new Set())
        reload()
        return
      }
      setMessage(getErrorMessage(error))
    }
  }

  return (
    <main className="page booking-select-page">
      {header}
      <h2 className="booking-select-title">{`${section}구역에서\n좌석을 선택해 주세요`}</h2>

      {sectionSeats.length === 0 ? (
        <p className="booking-select-message">이 구역에는 좌석이 없어요.</p>
      ) : (
        <SeatGrid seats={sectionSeats} selectedIds={new Set(selectedSeats.map(seat => seat.seatId))} onToggle={toggle} />
      )}

      {message && <p className="booking-select-alert" role="alert">{message}</p>}

      <SelectionBar
        title={selectedSeats.length > 0 ? formatSeatLabels(selectedSeats) : '좌석을 골라 주세요'}
        description={
          selectedSeats.length > 0
            ? `${formatPrice(totalPrice)} (총 ${selectedSeats.length}매)`
            : `1인 최대 ${limit}매`
        }
        actionLabel="선택 완료하기"
        actionDisabled={selectedSeats.length === 0}
        loading={submitting}
        onAction={submit}
      />
    </main>
  )
}
