import { Navigate, Outlet, useLocation, useParams } from 'react-router'
import { BackHeader } from '../components/layouts/back-header'
import { paths } from '../config/paths'
import { useActiveAdmission } from '../features/queue/hooks/use-active-admission'
import { parseId } from '../utils/parse-id'
import './routes/booking-select.css'

/** 예매 작업열에 입장한 회원만 회차 선택부터 예매 확인까지 볼 수 있게 한다 */
export function RequireActiveQueue() {
  const params = useParams()
  const performanceId = parseId(params.performanceId)

  if (performanceId === null) return <Navigate to={paths.home()} replace />
  return <ActiveQueueGate key={performanceId} performanceId={performanceId} />
}

function ActiveQueueGate({ performanceId }: { performanceId: number }) {
  const location = useLocation()
  const { state, retry } = useActiveAdmission(performanceId, location.pathname)

  if (state.status === 'admitted') return <Outlet />
  if (state.status === 'not-admitted') return <Navigate to={paths.booking.queue(performanceId)} replace />

  return (
    <main className="page booking-select-page">
      <BackHeader title="예매하기" fallbackTo={paths.performance(performanceId)} />
      {state.status === 'checking' ? (
        <p className="booking-select-message">예매 화면을 준비하는 중이에요.</p>
      ) : (
        <div className="booking-select-message" role="alert">
          <p>{state.message}</p>
          <button className="booking-select-retry" type="button" onClick={retry}>다시 시도</button>
        </div>
      )}
    </main>
  )
}
