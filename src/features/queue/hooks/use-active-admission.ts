import { useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getQueueStatus } from '../api/get-queue-status'
import { leaveQueue } from '../api/leave-queue'
import { isQueueOwner, releaseQueue, wasReloadedAt } from '../utils/queue-session'

export type ActiveAdmissionState =
  | { status: 'checking' }
  | { status: 'admitted' }
  | { status: 'kicked' }
  | { status: 'other-window' }
  | { status: 'error'; message: string }

/**
 * 이 탭이 이 공연의 예매 작업열에 입장한 상태인지 확인한다
 *
 * 서버에 작업열 상태가 있어도 이 탭이 대기열에 등록한 탭이 아니면 입장으로 보지 않는다
 * 새로고침한 탭은 작업열에서 빼고 내보내고, 복제하거나 새로 연 탭은 다른 창에서 진행 중이라고 알린다
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

    function kick() {
      releaseQueue()
      setState({ status: 'kicked' })
    }

    getQueueStatus({ signal })
      .then(queue => {
        if (signal.aborted) return
        const active = queue.status === 'ACTIVE' && queue.performanceId === performanceId

        if (isQueueOwner(performanceId)) {
          if (active) setState({ status: 'admitted' })
          else kick()
          return
        }
        if (wasReloadedAt(window.location.pathname)) {
          // 이전 화면이 보낸 퇴장 요청보다 이 조회가 먼저 도착한 경우라 직접 뺀다
          leaveQueue().catch(() => {})
          kick()
          return
        }
        if (queue.performanceId === performanceId) setState({ status: 'other-window' })
        else kick()
      })
      .catch(error => {
        if (signal.aborted) return
        if (error instanceof ApiError && error.code === 'QUEUE_ENTRY_NOT_FOUND') {
          kick()
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
