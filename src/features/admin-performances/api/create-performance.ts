import { api } from '../../../lib/api-client'
import type { CreatePerformanceRequest, CreatePerformanceResponse } from '../types'

/**
 * 공연 등록 (API-9)
 * 백엔드가 @RequestPart로 받으므로 multipart/form-data로 보냄
 * - performance: 공연 정보 JSON (Content-Type이 application/json이어야 해서 Blob으로 감쌈)
 * - poster: 포스터 이미지 (선택)
 */
export function createPerformance(request: CreatePerformanceRequest, poster: File | null) {
  const formData = new FormData()
  formData.append('performance', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  if (poster) formData.append('poster', poster)

  return api.post<CreatePerformanceResponse>('/admin/performances', formData)
}
