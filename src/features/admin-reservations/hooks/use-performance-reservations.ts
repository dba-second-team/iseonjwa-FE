import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../../lib/api-error'
import { getPerformanceReservations } from '../api/get-performance-reservations'
import type { PaymentStatus } from '../../reservations/types'
import type { AdminReservation } from '../types'

const PAGE_SIZE = 20

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success'
      reservations: AdminReservation[]
      page: number
      totalCount: number
    }

export function usePerformanceReservations(performanceId: number, paymentStatus: PaymentStatus) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [reloadCount, setReloadCount] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getPerformanceReservations(
      { performanceId, status: paymentStatus, page: 0, size: PAGE_SIZE },
      { signal: controller.signal },
    )
      .then(result => setState({
        status: 'success',
        reservations: result.items,
        page: 0,
        totalCount: result.totalCount,
      }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', message: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [performanceId, paymentStatus, reloadCount])

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
      const result = await getPerformanceReservations({
        performanceId,
        status: paymentStatus,
        page: nextPage,
        size: PAGE_SIZE,
      })
      setState(prev => {
        if (prev.status !== 'success') return prev
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