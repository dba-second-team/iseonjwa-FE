import { useCallback, useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getPerformance } from '../api/get-performance'
import { getSchedules } from '../api/get-schedules'
import type { PerformanceDetail, Schedule } from '../types'

type Result =
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; performance: PerformanceDetail; schedules: Schedule[] }

type State = { status: 'loading' } | Result

export function usePerformanceDetail(performanceId: number) {
  const isValidId = Number.isSafeInteger(performanceId) && performanceId > 0
  const [reloadCount, setReloadCount] = useState(0)
  const [response, setResponse] = useState<{ key: string; result: Result } | null>(null)
  const requestKey = `${performanceId}:${reloadCount}`

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    Promise.all([
      getPerformance(performanceId, { signal: controller.signal }),
      getSchedules(performanceId, { signal: controller.signal }),
    ])
      .then(([performance, schedules]) => {
        setResponse({ key: requestKey, result: { status: 'success', performance, schedules } })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const result: Result = error instanceof ApiError && error.status === 404
          ? { status: 'not-found' }
          : { status: 'error', message: getErrorMessage(error) }
        setResponse({ key: requestKey, result })
      })

    return () => controller.abort()
  }, [isValidId, performanceId, requestKey])

  const reload = useCallback(() => setReloadCount(count => count + 1), [])

  let state: State
  if (!isValidId) state = { status: 'not-found' }
  else if (response?.key === requestKey) state = response.result
  else state = { status: 'loading' }

  return { state, reload }
}