import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import ticketWaiting from '../../assets/booking/ticket-waiting.svg'
import { BackHeader } from '../../components/layouts/back-header'
import { paths } from '../../config/paths'
import { useWaitingQueue, type WaitingQueueState } from '../../features/queue/hooks/use-waiting-queue'
import { parseId } from '../../utils/parse-id'
import './booking-queue.css'

export function BookingQueueRoute() {
  const params = useParams()
  const performanceId = parseId(params.performanceId)

  if (performanceId === null) return <Navigate to={paths.home()} replace />
  return <BookingQueue key={performanceId} performanceId={performanceId} />
}

function BookingQueue({ performanceId }: { performanceId: number }) {
  const navigate = useNavigate()
  const { state, retry, startHere } = useWaitingQueue(performanceId)

  // 입장할 수 있게 되면 회차 선택으로. 뒤로 가기로 대기 화면에 돌아오지 않게 replace
  useEffect(() => {
    if (state.status === 'ready') navigate(paths.booking.schedules(performanceId), { replace: true })
  }, [state.status, navigate, performanceId])

  return (
    <main className="page queue-page">
      <BackHeader title="예매하기" fallbackTo={paths.performance(performanceId)} />

      <img className="queue-illustration" src={ticketWaiting} width="220" height="195" alt="" />

      {state.status === 'error' ? (
        <div className="queue-message" role="alert">
          <p>{state.message}</p>
          <button className="queue-action" type="button" onClick={retry}>다시 시도</button>
        </div>
      ) : state.status === 'other-window' ? (
        <div className="queue-message" role="alert">
          <p>다른 창에서 이미 예매를 진행하고 있어요.</p>
          <button className="queue-action" type="button" onClick={startHere}>이 창에서 예매하기</button>
        </div>
      ) : state.status === 'taken-over' ? (
        <div className="queue-message" role="alert">
          <p>다른 창에서 예매를 시작해서 이 창의 대기가 끝났어요.</p>
          <Link className="queue-action" to={paths.home()} replace>홈으로 가기</Link>
        </div>
      ) : state.status === 'other-performance' ? (
        <div className="queue-message" role="alert">
          <p>다른 공연의 대기열에 들어가 있어요.</p>
          <Link className="queue-action" to={paths.home()} replace>홈으로 가기</Link>
        </div>
      ) : (
        <WaitingStatus state={state} />
      )}
    </main>
  )
}

function WaitingStatus({ state }: { state: WaitingQueueState }) {
  const waiting = state.status === 'waiting' ? state : null
  const percent = waiting ? Math.round(waiting.progress * 100) : 0

  return (
    <section className="queue-status" aria-labelledby="queue-title">
      <h2 id="queue-title" className="queue-title">
        {state.status === 'ready' ? '곧 입장해요' : '접속 대기 중이에요'}
      </h2>
      <p className="queue-position" aria-live="polite">
        {waiting ? `${waiting.position.toLocaleString('ko-KR')}번째` : ' '}
      </p>
      <div
        className="queue-progress"
        role="progressbar"
        aria-label="대기 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="queue-progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="queue-notice">다시 접속하시면 대기시간이 늘어날 수 있어요.</p>
    </section>
  )
}
