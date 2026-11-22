import { useCallback, useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getPerformance } from '../../performances/api/get-performance'
import type { PerformanceDetail } from '../../performances/types'
import { getScheduleSeats } from '../api/get-schedule-seats'
import type { Seat } from '../types'

type Result =
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; performance: PerformanceDetail; seats: Seat[] }

type State = { status: 'loading' } | Result

/** 구역 선택과 좌석 선택에 필요한 공연 정보(1인 매수 제한)와 회차 좌석을 함께 불러옴 */
export function useSeatMap(performanceId: number, scheduleId: number) {
  const [reloadCount, setReloadCount] = useState(0)
  const [response, setResponse] = useState<{ key: string; result: Result } | null>(null)
  const requestKey = `${performanceId}:${scheduleId}:${reloadCount}`

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      getPerformance(performanceId, { signal: controller.signal }),
      getScheduleSeats(scheduleId, { signal: controller.signal }),
    ])
      .then(([performance, { seats }]) => {
        setResponse({ key: requestKey, result: { status: 'success', performance, seats } })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const result: Result = error instanceof ApiError && error.status === 404
          ? { status: 'not-found' }
          : { status: 'error', message: getErrorMessage(error) }
        setResponse({ key: requestKey, result })
      })

    return () => controller.abort()
  }, [performanceId, scheduleId, requestKey])

  const reload = useCallback(() => setReloadCount(count => count + 1), [])

  // 다시 불러오는 동안에도 이전 좌석을 보여 줘서 화면이 깜빡이지 않게 함
  let state: State
  if (response?.key === requestKey) state = response.result
  else if (response?.result.status === 'success') state = response.result
  else state = { status: 'loading' }

  return { state, reload, isRefreshing: response !== null && response.key !== requestKey }
}
