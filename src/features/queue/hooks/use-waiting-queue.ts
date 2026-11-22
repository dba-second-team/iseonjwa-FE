import { useCallback, useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { enterActiveQueue } from '../api/enter-active-queue'
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

function isApiError(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code
}

/**
 * 대기열 진입 → 순번 폴링 → 작업열 입장
 *
 * 1. 상태를 먼저 조회 (새로고침해도 기존 순번을 이어받기 위해)
 * 2. 대기열에 없으면(404 QUEUE_ENTRY_NOT_FOUND) 그때 등록
 * 3. canEnter가 true가 될 때까지 일정 간격으로 상태 조회
 * 4. canEnter가 true면 작업열 입장 요청, 성공하면 ready
 *    (그 사이 자리가 찼으면 409 CANNOT_ENTER_ACTIVE_QUEUE가 오므로 계속 대기)
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
        if (!isApiError(error, 'QUEUE_ENTRY_NOT_FOUND')) throw error
      }

      try {
        await registerWaiting(performanceId, { signal })
      } catch (error) {
        // 다른 탭에서 먼저 등록한 경우는 이미 대기 중이니 그대로 진행
        if (!isApiError(error, 'ALREADY_IN_QUEUE')) throw error
      }
      return getQueueStatus({ signal })
    }

    function ready() {
      clearInitialPosition(performanceId)
      setState({ status: 'ready' })
    }

    function showWaiting(queue: QueueState) {
      setState({
        status: 'waiting',
        position: queue.position,
        progress: getQueueProgress(performanceId, queue.position),
      })
    }

    /** 화면 상태를 바꾸고, 계속 폴링해야 하면 true */
    async function apply(queue: QueueState): Promise<boolean> {
      if (signal.aborted) return false
      if (queue.performanceId !== performanceId) {
        setState({ status: 'other-performance' })
        return false
      }
      // 이미 작업열에 있으면(새로고침 등) 바로 입장
      if (queue.status === 'ACTIVE') {
        ready()
        return false
      }
      if (!queue.canEnter) {
        showWaiting(queue)
        return true
      }

      try {
        await enterActiveQueue(performanceId, { signal })
      } catch (error) {
        // 상태 조회와 입장 요청 사이에 자리가 찬 경우
        if (isApiError(error, 'CANNOT_ENTER_ACTIVE_QUEUE')) {
          showWaiting(queue)
          return true
        }
        throw error
      }
      if (signal.aborted) return false
      ready()
      return false
    }

    function handleError(error: unknown) {
      if (signal.aborted) return
      setState({ status: 'error', message: getErrorMessage(error) })
    }

    function scheduleNext() {
      timer = setTimeout(() => {
        getQueueStatus({ signal })
          .then(apply)
          .then(keepPolling => {
            if (keepPolling) scheduleNext()
          })
          .catch(handleError)
      }, POLL_INTERVAL_MS)
    }

    enterOrResume()
      .then(apply)
      .then(keepPolling => {
        if (keepPolling) scheduleNext()
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
