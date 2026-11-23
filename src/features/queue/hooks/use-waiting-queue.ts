import { useCallback, useEffect, useState } from 'react'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { enterActiveQueue } from '../api/enter-active-queue'
import { getQueueStatus } from '../api/get-queue-status'
import { leaveQueue } from '../api/leave-queue'
import { registerWaiting } from '../api/register-waiting'
import type { QueueState } from '../types'
import { clearInitialPosition, getQueueProgress } from '../utils/progress'
import { claimQueue, isQueueOwner, onQueueLost, releaseQueue, wasReloadedAt } from '../utils/queue-session'

/** 순번을 다시 물어보는 간격 */
const POLL_INTERVAL_MS = 2000

export type WaitingQueueState =
  | { status: 'loading' }
  | { status: 'waiting'; position: number; progress: number }
  | { status: 'ready' }
  | { status: 'other-performance' }
  | { status: 'other-window' }
  | { status: 'error'; message: string }

function isApiError(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code
}

/**
 * 대기열 진입 → 순번 폴링 → 작업열 입장
 *
 * 1. 이 탭이 이미 등록한 대기열이 있으면 상태를 이어서 조회
 * 2. 없으면 등록. 같은 회원이 다른 탭에서 이미 등록했으면(409 ALREADY_IN_QUEUE) 막는다
 *    새로고침한 탭은 이전 화면이 보낸 퇴장 요청보다 등록이 먼저 도착할 수 있어서 직접 빠진 뒤 다시 등록
 * 3. canEnter가 true가 될 때까지 일정 간격으로 상태 조회
 * 4. canEnter가 true면 작업열 입장 요청, 성공하면 ready
 *    (그 사이 자리가 찼으면 409 CANNOT_ENTER_ACTIVE_QUEUE가 오므로 계속 대기)
 */
/** startWithTakeOver가 true면 처음부터 다른 탭의 대기를 끝내고 이 탭에서 다시 대기한다 */
export function useWaitingQueue(performanceId: number, startWithTakeOver = false) {
  const [retryCount, setRetryCount] = useState(0)
  const [takeOver, setTakeOver] = useState(startWithTakeOver)
  const [state, setState] = useState<WaitingQueueState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let timer: ReturnType<typeof setTimeout> | undefined

    async function register() {
      await registerWaiting(performanceId, { signal })
      claimQueue(performanceId)
    }

    /** 이 탭이 대기열 주인이 되면 상태를, 다른 탭이 주인이면 null을 돌려준다 */
    async function enterOrResume(): Promise<QueueState | null> {
      if (isQueueOwner(performanceId)) {
        try {
          return await getQueueStatus({ signal })
        } catch (error) {
          if (!isApiError(error, 'QUEUE_ENTRY_NOT_FOUND')) throw error
          releaseQueue()
        }
      }

      if (takeOver || wasReloadedAt(window.location.pathname)) {
        // 기존 탭이 대기를 이어가지 않도록 빠지기 전에 먼저 알린다
        claimQueue(performanceId)
        await leaveQueue()
        await register()
        return getQueueStatus({ signal })
      }

      try {
        await register()
      } catch (error) {
        if (!isApiError(error, 'ALREADY_IN_QUEUE')) throw error
        const queue = await getQueueStatus({ signal })
        if (signal.aborted) return null
        setState({ status: queue.performanceId === performanceId ? 'other-window' : 'other-performance' })
        return null
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
    async function apply(queue: QueueState | null): Promise<boolean> {
      if (queue === null || signal.aborted) return false
      if (queue.performanceId !== performanceId) {
        releaseQueue()
        setState({ status: 'other-performance' })
        return false
      }
      // 이 탭이 이미 작업열에 들어가 있으면 바로 입장
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
      // 다른 탭에서 이 창의 대기를 가져간 경우
      if (isApiError(error, 'QUEUE_ENTRY_NOT_FOUND')) {
        releaseQueue()
        setState({ status: 'other-window' })
        return
      }
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

    const stopListening = onQueueLost(() => {
      controller.abort()
      clearTimeout(timer)
      setState({ status: 'other-window' })
    })

    enterOrResume()
      .then(apply)
      .then(keepPolling => {
        if (keepPolling) scheduleNext()
      })
      .catch(handleError)

    return () => {
      controller.abort()
      clearTimeout(timer)
      stopListening()
    }
  }, [performanceId, retryCount, takeOver])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setRetryCount(count => count + 1)
  }, [])

  /** 다른 탭의 대기를 끝내고 이 탭에서 처음부터 다시 대기한다 */
  const startHere = useCallback(() => {
    setState({ status: 'loading' })
    setTakeOver(true)
    setRetryCount(count => count + 1)
  }, [])

  return { state, retry, startHere }
}
