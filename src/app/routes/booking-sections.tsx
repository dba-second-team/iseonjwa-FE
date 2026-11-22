import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { SelectionBar } from '../../components/layouts/selection-bar'
import { paths } from '../../config/paths'
import { SectionMap } from '../../features/seats/components/section-map'
import { useSeatMap } from '../../features/seats/hooks/use-seat-map'
import type { SeatSection } from '../../features/seats/types'
import { formatPrice, summarizeSections } from '../../features/seats/utils/seat'
import { parseId } from '../../utils/parse-id'
import './booking-select.css'

export function BookingSectionsRoute() {
  const params = useParams()
  const performanceId = parseId(params.performanceId)
  const scheduleId = parseId(params.scheduleId)

  if (performanceId === null || scheduleId === null) return <Navigate to={paths.home()} replace />
  return <BookingSections performanceId={performanceId} scheduleId={scheduleId} />
}

function BookingSections({ performanceId, scheduleId }: { performanceId: number; scheduleId: number }) {
  const navigate = useNavigate()
  const { state, reload } = useSeatMap(performanceId, scheduleId)
  const [selected, setSelected] = useState<SeatSection | null>(null)

  const header = <BackHeader title="예매하기" fallbackTo={paths.performance(performanceId)} />

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

  const summaries = summarizeSections(state.seats)
  const selectedSummary = selected ? summaries.get(selected) : undefined

  return (
    <main className="page booking-select-page">
      {header}
      <h2 className="booking-select-title">구역을 선택해 주세요</h2>

      <SectionMap summaries={summaries} selected={selected} onSelect={setSelected} />

      <SelectionBar
        title={selected ? `${selected} 구역` : '구역을 골라 주세요'}
        description={selectedSummary?.price != null ? formatPrice(selectedSummary.price) : undefined}
        actionLabel="좌석 선택하기"
        actionDisabled={selected === null}
        onAction={() => {
          if (selected) navigate(paths.booking.seats(performanceId, scheduleId, selected))
        }}
      />
    </main>
  )
}
