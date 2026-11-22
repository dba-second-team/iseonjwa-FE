import { api } from '../../../lib/api-client'
import type { PerformancePage } from '../types'

type GetPerformancesParams = {
  page: number
  size: number
}

export function getPerformances({ page, size }: GetPerformancesParams, options?: { signal?: AbortSignal }) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  return api.get<PerformancePage>(`/performances?${query}`, options)
}