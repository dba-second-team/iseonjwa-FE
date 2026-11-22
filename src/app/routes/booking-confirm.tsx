import { useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { Button } from '../../components/ui/button'
import { paths } from '../../config/paths'
import { usePerformanceDetail } from '../../features/performances/hooks/use-performance-detail'
import type { PerformanceDetail, Schedule } from '../../features/performances/types'
import { formatGenre, formatScheduleOption } from '../../features/performances/utils/format'
import { createReservation } from '../../features/reservations/api/create-reservation'
import { ReservationReviewDialog } from '../../features/reservations/components/reservation-review-dialog'
import type { HeldSeatsState, Seat } from '../../features/seats/types'
import { formatPrice, formatSeatLabels } from '../../features/seats/utils/seat'
import { ApiError, getErrorMessage } from '../../lib/api-error'
import { useAuth } from '../../lib/auth'
import { parseId } from '../../utils/parse-id'
import './booking-confirm.css'

function readHeldSeats(state: unknown): Seat[] | null {
  if (typeof state !== 'object' || state === null) return null
  const { seats } = state as Partial<HeldSeatsState>
  return Array.isArray(seats) && seats.length > 0 ? seats : null
}

export function BookingConfirmRoute() {
  const params = useParams()
  const location = useLocation()
  const performanceId = parseId(params.performanceId)
  const scheduleId = parseId(params.scheduleId)
  const seats = readHeldSeats(location.state)

  if (performanceId === null || scheduleId === null) return <Navigate to={paths.home()} replace />
  // 새로고침 등으로 선택한 좌석 정보가 없으면 구역 선택부터 다시
  if (!seats) return <Navigate to={paths.booking.sections(performanceId, scheduleId)} replace />
  return <BookingConfirm performanceId={performanceId} scheduleId={scheduleId} seats={seats} />
}

type BookingConfirmProps = {
  performanceId: number
  scheduleId: number
  seats: Seat[]
}

function BookingConfirm({ performanceId, scheduleId, seats }: BookingConfirmProps) {
  const { state, reload } = usePerformanceDetail(performanceId)
  const header = <BackHeader title="예매하기" fallbackTo={paths.booking.sections(performanceId, scheduleId)} />

  if (state.status === 'loading') {
    return (
      <main className="page booking-confirm-page">
        {header}
        <p className="booking-confirm-message">예매 정보를 불러오는 중이에요.</p>
      </main>
    )
  }

  const schedule = state.status === 'success'
    ? state.schedules.find(item => item.scheduleId === scheduleId)
    : undefined

  if (state.status !== 'success' || !schedule) {
    return (
      <main className="page booking-confirm-page">
        {header}
        <div className="booking-confirm-message" role="alert">
          <p>{state.status === 'error' ? state.message : '존재하지 않는 공연 또는 회차예요.'}</p>
          {state.status === 'error' && (
            <button className="booking-confirm-retry" type="button" onClick={reload}>다시 시도</button>
          )}
        </div>
      </main>
    )
  }

  return <BookingConfirmView header={header} performance={state.performance} schedule={schedule} seats={seats} />
}

type Step = 'review' | 'payment'

type BookingConfirmViewProps = {
  header: ReactNode
  performance: PerformanceDetail
  schedule: Schedule
  seats: Seat[]
}

function BookingConfirmView({ header, performance, schedule, seats }: BookingConfirmViewProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<Step | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [holdExpired, setHoldExpired] = useState(false)

  const { date, time } = formatScheduleOption(schedule.startAt)
  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0)
  const seatsPath = paths.booking.seats(performance.performanceId, schedule.scheduleId, seats[0].section)

  function closeDialog() {
    setStep(null)
    setDialogError(null)
  }

  async function pay() {
    setSubmitting(true)
    setDialogError(null)
    try {
      const reservation = await createReservation({
        scheduleId: schedule.scheduleId,
        seatIds: seats.map(seat => seat.seatId),
        // 가상 결제라 결제 수단 선택 화면 없이 카드로 고정
        paymentMethod: 'CARD',
      })
      navigate(paths.reservationComplete(reservation.reservationId), { replace: true })
    } catch (error) {
      setSubmitting(false)
      if (error instanceof ApiError && error.code === 'HOLD_EXPIRED') {
        setStep(null)
        setHoldExpired(true)
        return
      }
      setDialogError(getErrorMessage(error))
    }
  }

  return (
    <main className="page booking-confirm-page">
      {header}

      <section className="booking-confirm-summary" aria-label="공연 정보">
        {performance.posterUrl ? (
          <img
            className="booking-confirm-poster"
            src={performance.posterUrl}
            alt={`${performance.title} 공연 포스터`}
            width="80"
            height="107"
          />
        ) : (
          <div className="booking-confirm-poster booking-confirm-poster-empty" aria-hidden="true" />
        )}
        <div className="booking-confirm-performance">
          <p className="booking-confirm-genre">{formatGenre(performance.genre)}</p>
          <h2 className="booking-confirm-title">{performance.title}</h2>
          <p className="booking-confirm-venue">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 14.5s5-4.3 5-8.3a5 5 0 0 0-10 0c0 4 5 8.3 5 8.3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="6.3" r="1.8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            {performance.venueName}
          </p>
        </div>
      </section>

      <section className="booking-confirm-section" aria-labelledby="booking-confirm-schedule">
        <h3 id="booking-confirm-schedule" className="booking-confirm-heading">회차 정보</h3>
        <p className="booking-confirm-schedule">
          {schedule.round}회차 {date}
          <span className="booking-confirm-divider" aria-hidden="true">|</span>
          {time}
        </p>
      </section>

      <section className="booking-confirm-section" aria-labelledby="booking-confirm-seats">
        <h3 id="booking-confirm-seats" className="booking-confirm-heading">예매 좌석 정보</h3>
        <dl className="booking-confirm-list">
          <div className="booking-confirm-row">
            <dt>매수</dt>
            <dd>{seats.length}매</dd>
          </div>
          <div className="booking-confirm-row">
            <dt>좌석</dt>
            <dd>{seats[0].section}구역 {formatSeatLabels(seats)}</dd>
          </div>
          <div className="booking-confirm-row">
            <dt>결제 금액</dt>
            <dd>{formatPrice(totalPrice)}</dd>
          </div>
        </dl>
      </section>

      {holdExpired && (
        <div className="booking-confirm-expired" role="alert">
          <p>좌석 선점 시간(5분)이 지났어요. 좌석을 다시 선택해 주세요.</p>
          <Link className="booking-confirm-retry" to={seatsPath} replace>좌석 다시 고르기</Link>
        </div>
      )}

      <div className="booking-confirm-footer">
        <Button disabled={holdExpired} onClick={() => setStep('review')}>예매하기</Button>
      </div>

      {step && (
        <ReservationReviewDialog
          performanceTitle={performance.title}
          dateTime={`${date} | ${time}`}
          price={formatPrice(totalPrice)}
          bookerName={user?.name ?? ''}
          confirmLabel={step === 'review' ? '예매할게요' : '결제할게요'}
          loading={submitting}
          error={dialogError}
          onConfirm={step === 'review' ? () => setStep('payment') : pay}
          onClose={closeDialog}
        />
      )}
    </main>
  )
}
