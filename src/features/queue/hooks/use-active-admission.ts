import { useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getQueueStatus } from '../api/get-queue-status'
import { leaveQueue } from '../api/leave-queue'
import { isQueueOwner, onQueueLost, releaseQueue, wasReloadedAt } from '../utils/queue-session'

/** 예매 화면에 머무는 동안 작업열 상태를 다시 확인하는 간격 */
const RECHECK_INTERVAL_MS = 3000

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
 * 같은 브라우저의 다른 탭이 예매를 가져가면 바로 막고, 그 밖의 경우를 위해 일정 간격과 탭으로 돌아올 때도 다시 확인한다
 * 다시 확인하는 동안에는 이전 결과를 유지해 화면이 깜빡이지 않게 한다
 */
export function useActiveAdmission(performanceId: number, checkKey: string) {
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<ActiveAdmissionState>({ status: 'checking' })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let checking = false
    let stopped = false
    let admitted = false

    function stop(next: ActiveAdmissionState) {
      stopped = true
      setState(next)
    }

    function kick() {
      releaseQueue()
      stop({ status: 'kicked' })
    }

    function check() {
      if (checking || stopped || signal.aborted) return
      checking = true

      getQueueStatus({ signal })
        .then(queue => {
          if (signal.aborted) return
          const active = queue.status === 'ACTIVE' && queue.performanceId === performanceId

          if (isQueueOwner(performanceId)) {
            if (active) {
              // 이미 입장 상태면 같은 상태로 다시 그리지 않음
              if (!admitted) setState({ status: 'admitted' })
              admitted = true
            } else if (queue.performanceId === performanceId) {
              // 다른 창에서 "이 창에서 예매하기"로 대기를 새로 시작한 경우
              releaseQueue()
              stop({ status: 'other-window' })
            } else {
              kick()
            }
            return
          }
          if (wasReloadedAt(window.location.pathname)) {
            // 이전 화면이 보낸 퇴장 요청보다 이 조회가 먼저 도착한 경우라 직접 뺀다
            leaveQueue().catch(() => {})
            kick()
            return
          }
          if (queue.performanceId === performanceId) stop({ status: 'other-window' })
          else kick()
        })
        .catch(error => {
          if (signal.aborted) return
          if (error instanceof ApiError && error.code === 'QUEUE_ENTRY_NOT_FOUND') {
            kick()
            return
          }
          // 예매 화면을 보는 중에 잠깐 실패한 확인은 다음 확인에 맡긴다
          if (admitted) return
          stop({ status: 'error', message: getErrorMessage(error) })
        })
        .finally(() => {
          checking = false
        })
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check()
    }

    const stopListening = onQueueLost(() => stop({ status: 'other-window' }))

    check()
    const timer = setInterval(check, RECHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      controller.abort()
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stopListening()
    }
  }, [performanceId, checkKey, retryCount])

  function retry() {
    setState({ status: 'checking' })
    setRetryCount(count => count + 1)
  }

  return { state, retry }
}
