import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../../lib/api-error'
import { getPerformances } from '../api/get-performances'
import type { PerformanceSummary } from '../types'

const PAGE_SIZE = 20

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success'
      performances: PerformanceSummary[]
      page: number
      totalCount: number
    }

export function usePerformances() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [reloadCount, setReloadCount] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getPerformances({ page: 0, size: PAGE_SIZE }, { signal: controller.signal })
      .then(result => setState({
        status: 'success',
        performances: result.items,
        page: 0,
        totalCount: result.totalCount,
      }))
      .catch((error: unknown) => {
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
      const result = await getPerformances({ page: nextPage, size: PAGE_SIZE })
      setState(prev => {
        if (prev.status !== 'success') return prev
        const loadedIds = new Set(prev.performances.map(performance => performance.performanceId))
        const newItems = result.items.filter(performance => !loadedIds.has(performance.performanceId))
        return {
          status: 'success',
          performances: [...prev.performances, ...newItems],
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