import { useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getQueueStatus } from '../api/get-queue-status'

export type ActiveAdmissionState =
  | { status: 'checking' }
  | { status: 'admitted' }
  | { status: 'not-admitted' }
  | { status: 'error'; message: string }

/**
 * 이 공연의 예매 작업열에 입장한 상태인지 확인한다
 *
 * checkKey가 바뀔 때마다 다시 확인한다 (화면을 옮길 때 작업열 만료를 다시 보기 위해)
 * 다시 확인하는 동안에는 이전 결과를 유지해 화면이 깜빡이지 않게 한다
 */
export function useActiveAdmission(performanceId: number, checkKey: string) {
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<ActiveAdmissionState>({ status: 'checking' })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    getQueueStatus({ signal })
      .then(queue => {
        if (signal.aborted) return
        const admitted = queue.status === 'ACTIVE' && queue.performanceId === performanceId
        setState({ status: admitted ? 'admitted' : 'not-admitted' })
      })
      .catch(error => {
        if (signal.aborted) return
        if (error instanceof ApiError && error.code === 'QUEUE_ENTRY_NOT_FOUND') {
          setState({ status: 'not-admitted' })
          return
        }
        setState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [performanceId, checkKey, retryCount])

  function retry() {
    setState({ status: 'checking' })
    setRetryCount(count => count + 1)
  }

  return { state, retry }
}
