import { api } from '../../../lib/api-client'
import type { AdminPerformancePage } from '../types'

type GetAdminPerformancesParams = {
  page: number
  size: number
}

export function getAdminPerformances({ page, size }: GetAdminPerformancesParams, options?: { signal?: AbortSignal }) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  return api.get<AdminPerformancePage>(`/admin/performances?${query}`, options)
}