import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../../lib/api-error'
import { getMyReservations } from '../api/get-my-reservations'
import type { MyReservation } from '../types'

const PAGE_SIZE = 20

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success'
      reservations: MyReservation[]
      page: number
      totalCount: number
    }

export function useMyReservations() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [reloadCount, setReloadCount] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getMyReservations({ page: 0, size: PAGE_SIZE }, { signal: controller.signal })
      .then(result => setState({
        status: 'success',
        reservations: result.items,
        page: 0,
        totalCount: result.totalCount,
      }))
      .catch((error: unknown) => {
        // 화면을 떠났거나 다시 시도로 취소된 요청은 무시
        if (controller.signal.aborted) return
        setState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [reloadCount])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setLoadMoreError(null)
    setReloadCount(count => count + 1)
  }, [])

  const hasMore = state.status === 'success' && (state.page + 1) * PAGE_SIZE < state.totalCount

  async function loadMore() {
    if (state.status !== 'success' || !hasMore || isLoadingMore) return
    const nextPage = state.page + 1

    setIsLoadingMore(true)
    setLoadMoreError(null)
    try {
      const result = await getMyReservations({ page: nextPage, size: PAGE_SIZE })
      setState(prev => {
        if (prev.status !== 'success') return prev
        // 그 사이 새 예매가 생기면 순서가 밀려 같은 예매가 다시 올 수 있어서 걸러 냄
        const loadedIds = new Set(prev.reservations.map(reservation => reservation.reservationId))
        const newItems = result.items.filter(reservation => !loadedIds.has(reservation.reservationId))
        return {
          status: 'success',
          reservations: [...prev.reservations, ...newItems],
          page: nextPage,
          totalCount: result.totalCount,
        }
      })
    } catch (error) {
      setLoadMoreError(getErrorMessage(error))
    } finally {
      setIsLoadingMore(false)
    }
  }

  return { state, reload, hasMore, isLoadingMore, loadMoreError, loadMore }
}