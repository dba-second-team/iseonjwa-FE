import { useNavigate } from 'react-router'
import ticketComplete from '../../assets/booking/ticket-complete.svg'
import { Button } from '../../components/ui/button'
import { paths } from '../../config/paths'
import './reservation-complete.css'

export function ReservationCompleteRoute() {
  const navigate = useNavigate()

  return (
    <main className="page reservation-complete-page">
      <div className="reservation-complete-content">
        <img className="reservation-complete-illustration" src={ticketComplete} width="205" height="154" alt="" />
        <h1 className="reservation-complete-title">예매가 완료되었어요!</h1>
      </div>
      <div className="reservation-complete-footer">
        <Button onClick={() => navigate(paths.home(), { replace: true })}>홈으로</Button>
      </div>
    </main>
  )
}
