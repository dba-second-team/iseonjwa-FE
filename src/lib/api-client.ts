import { API_BASE_URL } from '../config/env'
import { ApiError } from './api-error'
import { getAuthUser } from './auth'

/**
 * 모든 API 호출이 거치는 공통 함수
 */

type ApiResponse<T> = {
  data: T
}

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  body?: unknown
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: initHeaders, ...init } = options

  const headers = new Headers(initHeaders)
  // FormData는 브라우저가 boundary를 포함한 Content-Type을 직접 붙이므로 건드리지 않음
  const isFormData = body instanceof FormData

  headers.set('Accept', 'application/json')
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json')

  const user = getAuthUser()
  if (user && !headers.has('X-Member-Id')) headers.set('X-Member-Id', String(user.memberId))

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  } catch (error) {
    // 요청 취소는 에러 화면을 띄우면 안 되니 그대로 던짐
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw ApiError.network(error)
  }

  const payload = await readJson(response)
  if (!response.ok) throw ApiError.fromResponse(response.status, payload)

  // 204 No Content 처럼 본문이 없으면 undefined
  return (payload as ApiResponse<T> | undefined)?.data as T
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
}