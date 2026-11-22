import { useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { Button } from '../../components/ui/button'
import { ScheduleSheet } from '../../features/performances/components/schedule-sheet'
import { usePerformanceDetail } from '../../features/performances/hooks/use-performance-detail'
import type { PerformanceDetail, Schedule } from '../../features/performances/types'
import {
  formatGenre,
  formatPeriod,
  formatScheduleShort,
  getUnavailableLabel,
} from '../../features/performances/utils/format'
import { useAuth } from '../../lib/auth'
import './performance-detail.css'

type Tab = 'intro' | 'notice'

export function PerformanceDetailRoute() {
  const params = useParams()
  const performanceId = Number(params.performanceId)
  const { state, reload } = usePerformanceDetail(performanceId)

  if (state.status === 'loading') {
    return (
      <main className="page performance-detail-page">
        <BackHeader />
        <p className="performance-detail-message">공연 정보를 불러오는 중이에요.</p>
      </main>
    )
  }

  if (state.status === 'not-found') {
    return (
      <main className="page performance-detail-page">
        <BackHeader />
        <div className="performance-detail-message">
          <p>존재하지 않는 공연이에요.</p>
          <Link className="performance-detail-home" to="/">홈으로 가기</Link>
        </div>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="page performance-detail-page">
        <BackHeader />
        <div className="performance-detail-message" role="alert">
          <p>{state.message}</p>
          <button className="performance-detail-retry" type="button" onClick={reload}>다시 시도</button>
        </div>
      </main>
    )
  }

  return <PerformanceDetailView performance={state.performance} schedules={state.schedules} />
}

type PerformanceDetailViewProps = {
  performance: PerformanceDetail
  schedules: Schedule[]
}

function PerformanceDetailView({ performance, schedules }: PerformanceDetailViewProps) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [tab, setTab] = useState<Tab>('intro')
  const [sheetOpen, setSheetOpen] = useState(false)
  const tabsId = useId()

  const unavailableLabel = getUnavailableLabel(performance.status, schedules.length)

  function selectSchedule(schedule: Schedule) {
    const nextPath = `/schedules/${schedule.scheduleId}/sections`
    setSheetOpen(false)
    if (isLoggedIn) navigate(nextPath)
    else navigate('/login', { state: { from: nextPath } })
  }

  return (
    <main className="page performance-detail-page">
      <BackHeader title={performance.title} />

      <section className="performance-detail-summary">
        {performance.posterUrl ? (
          <img
            className="performance-detail-poster"
            src={performance.posterUrl}
            alt={`${performance.title} 공연 포스터`}
            width="140"
            height="187"
          />
        ) : (
          <div className="performance-detail-poster performance-detail-poster-empty" aria-hidden="true" />
        )}
        <p className="performance-detail-genre">{formatGenre(performance.genre)}</p>
        <h2 className="performance-detail-title">{performance.title}</h2>
      </section>

      <dl className="performance-detail-info">
        <div className="performance-detail-info-row">
          <dt className="performance-detail-icon" aria-label="공연장">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 14.5s5-4.3 5-8.3a5 5 0 0 0-10 0c0 4 5 8.3 5 8.3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="6.3" r="1.8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </dt>
          <dd className="performance-detail-info-text">{performance.venueName}</dd>
        </div>

        <div className="performance-detail-info-row performance-detail-info-period">
          <dt className="performance-detail-icon" aria-label="공연 기간">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 4.6V8l2.3 1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </dt>
          <dd className="performance-detail-info-text">
            <span className="performance-detail-period">
              <span>{formatPeriod(performance.startDate, performance.endDate)}</span>
              <span>{performance.runningTime}분</span>
            </span>
            {schedules.length > 0 && (
              <ul className="performance-detail-schedules">
                {schedules.map(schedule => {
                  const { round, dateTime } = formatScheduleShort(schedule.round, schedule.startAt)
                  return (
                    <li key={schedule.scheduleId}>
                      <span className="performance-detail-round">{round}</span>
                      {dateTime}
                    </li>
                  )
                })}
              </ul>
            )}
          </dd>
        </div>
      </dl>

      <div className="performance-detail-tabs" role="tablist" aria-label="공연 정보">
        <button
          id={`${tabsId}-intro-tab`}
          className="performance-detail-tab"
          type="button"
          role="tab"
          aria-selected={tab === 'intro'}
          aria-controls={`${tabsId}-intro`}
          onClick={() => setTab('intro')}
        >
          공연 소개
        </button>
        <button
          id={`${tabsId}-notice-tab`}
          className="performance-detail-tab"
          type="button"
          role="tab"
          aria-selected={tab === 'notice'}
          aria-controls={`${tabsId}-notice`}
          onClick={() => setTab('notice')}
        >
          유의사항
        </button>
      </div>

      {tab === 'intro' ? (
        <section
          id={`${tabsId}-intro`}
          className="performance-detail-panel"
          role="tabpanel"
          aria-labelledby={`${tabsId}-intro-tab`}
        >
          <h3 className="performance-detail-panel-title">공연소개</h3>
          <p className="performance-detail-text">{performance.title}</p>
          {performance.description && <p className="performance-detail-text">{performance.description}</p>}
        </section>
      ) : (
        <section
          id={`${tabsId}-notice`}
          className="performance-detail-panel"
          role="tabpanel"
          aria-labelledby={`${tabsId}-notice-tab`}
        >
          <h3 className="performance-detail-panel-title">유의사항</h3>
          <ul className="performance-detail-notice">
            <li>한 회차당 1인 최대 {performance.maxTicketsPerMember}매까지 예매할 수 있어요.</li>
            <li>좌석을 선택하면 5분 동안 선점되고, 그 안에 결제하지 않으면 선점이 풀려요.</li>
            <li>공연 당일에는 예매를 취소할 수 없어요.</li>
          </ul>
        </section>
      )}

      <div className="performance-detail-footer">
        {unavailableLabel ? (
          <button className="performance-detail-unavailable" type="button" disabled>
            {unavailableLabel}
          </button>
        ) : (
          <Button onClick={() => setSheetOpen(true)}>예매하기</Button>
        )}
      </div>

      {sheetOpen && (
        <ScheduleSheet schedules={schedules} onSelect={selectSchedule} onClose={() => setSheetOpen(false)} />
      )}
    </main>
  )
}