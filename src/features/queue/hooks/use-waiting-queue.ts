import { useCallback, useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { getQueueStatus } from '../api/get-queue-status'
import { registerWaiting } from '../api/register-waiting'
import type { QueueState } from '../types'
import { clearInitialPosition, getQueueProgress } from '../utils/progress'

/** 순번을 다시 물어보는 간격 */
const POLL_INTERVAL_MS = 2000

export type WaitingQueueState =
  | { status: 'loading' }
  | { status: 'waiting'; position: number; progress: number }
  | { status: 'ready' }
  | { status: 'other-performance' }
  | { status: 'error'; message: string }

/**
 * 대기열 진입 → 순번 폴링 → 입장 가능 여부 판단
 *
 * 1. 상태를 먼저 조회 (새로고침해도 기존 순번을 이어받기 위해)
 * 2. 대기열에 없으면(404 QUEUE_ENTRY_NOT_FOUND) 그때 등록
 * 3. canEnter가 true가 될 때까지 일정 간격으로 상태 조회
 */
export function useWaitingQueue(performanceId: number) {
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState<WaitingQueueState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let timer: ReturnType<typeof setTimeout> | undefined

    async function enterOrResume(): Promise<QueueState> {
      try {
        return await getQueueStatus({ signal })
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== 'QUEUE_ENTRY_NOT_FOUND') throw error
      }

      try {
        await registerWaiting(performanceId, { signal })
      } catch (error) {
        // 다른 탭에서 먼저 등록한 경우는 이미 대기 중이니 그대로 진행
        if (!(error instanceof ApiError) || error.code !== 'ALREADY_IN_QUEUE') throw error
      }
      return getQueueStatus({ signal })
    }

    /** 화면 상태를 바꾸고, 계속 폴링해야 하면 true */
    function apply(queue: QueueState): boolean {
      if (signal.aborted) return false
      if (queue.performanceId !== performanceId) {
        setState({ status: 'other-performance' })
        return false
      }
      if (queue.status === 'ACTIVE' || queue.canEnter) {
        clearInitialPosition(performanceId)
        setState({ status: 'ready' })
        return false
      }
      setState({
        status: 'waiting',
        position: queue.position,
        progress: getQueueProgress(performanceId, queue.position),
      })
      return true
    }

    function scheduleNext() {
      timer = setTimeout(() => {
        getQueueStatus({ signal })
          .then(queue => {
            if (apply(queue)) scheduleNext()
          })
          .catch(handleError)
      }, POLL_INTERVAL_MS)
    }

    function handleError(error: unknown) {
      if (signal.aborted) return
      setState({ status: 'error', message: getErrorMessage(error) })
    }

    enterOrResume()
      .then(queue => {
        if (apply(queue)) scheduleNext()
      })
      .catch(handleError)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [performanceId, retryCount])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRetryCount(count => count + 1)
  }, [])

  return { state, retry }
}
