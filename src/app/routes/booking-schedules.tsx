import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { SelectionBar } from '../../components/layouts/selection-bar'
import { paths } from '../../config/paths'
import { ScheduleOptions } from '../../features/performances/components/schedule-options'
import { usePerformanceDetail } from '../../features/performances/hooks/use-performance-detail'
import type { Schedule } from '../../features/performances/types'
import { formatScheduleOption } from '../../features/performances/utils/format'
import { parseId } from '../../utils/parse-id'
import './booking-select.css'

export function BookingSchedulesRoute() {
  const params = useParams()
  const performanceId = parseId(params.performanceId)

  if (performanceId === null) return <Navigate to={paths.home()} replace />
  return <BookingSchedules performanceId={performanceId} />
}

function BookingSchedules({ performanceId }: { performanceId: number }) {
  const { state, reload } = usePerformanceDetail(performanceId)
  const header = <BackHeader title="예매하기" fallbackTo={paths.performance(performanceId)} />

  if (state.status === 'loading') {
    return (
      <main className="page booking-select-page">
        {header}
        <p className="booking-select-message">회차 정보를 불러오는 중이에요.</p>
      </main>
    )
  }

  if (state.status !== 'success') {
    return (
      <main className="page booking-select-page">
        {header}
        <div className="booking-select-message" role="alert">
          <p>{state.status === 'error' ? state.message : '존재하지 않는 공연이에요.'}</p>
          {state.status === 'error' && (
            <button className="booking-select-retry" type="button" onClick={reload}>다시 시도</button>
          )}
        </div>
      </main>
    )
  }

  if (state.schedules.length === 0) {
    return (
      <main className="page booking-select-page">
        {header}
        <p className="booking-select-message">예매 가능한 회차가 없어요.</p>
      </main>
    )
  }

  return <ScheduleSelect header={header} performanceId={performanceId} schedules={state.schedules} />
}

type ScheduleSelectProps = {
  header: ReactNode
  performanceId: number
  schedules: Schedule[]
}

function ScheduleSelect({ header, performanceId, schedules }: ScheduleSelectProps) {
  const navigate = useNavigate()
  // 회차가 하나뿐이면 고를 게 없으니 미리 선택
  const [selectedId, setSelectedId] = useState<number | null>(
    schedules.length === 1 ? schedules[0].scheduleId : null,
  )
  const selected = schedules.find(schedule => schedule.scheduleId === selectedId)
  const selectedOption = selected ? formatScheduleOption(selected.startAt) : null

  return (
    <main className="page booking-select-page">
      {header}
      <h2 className="booking-select-title">관람할 회차를 선택해 주세요</h2>

      <ScheduleOptions schedules={schedules} selectedId={selectedId} onSelect={setSelectedId} />

      <SelectionBar
        title={selected ? `${selected.round}회차` : '회차를 골라 주세요'}
        description={selectedOption ? `${selectedOption.date} ${selectedOption.time}` : undefined}
        actionLabel="구역 선택하기"
        actionDisabled={!selected}
        onAction={() => {
          if (selected) navigate(paths.booking.sections(performanceId, selected.scheduleId))
        }}
      />
    </main>
  )
}
