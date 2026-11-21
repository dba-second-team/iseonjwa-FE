export type ErrorResponse = {
  errorCode: string
  message: string
}

export const NETWORK_ERROR = 'NETWORK_ERROR'
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

const NETWORK_ERROR_MESSAGE = '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.'
const UNKNOWN_ERROR_MESSAGE = '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  static fromResponse(status: number, body: unknown): ApiError {
    if (isErrorResponse(body)) return new ApiError(status, body.errorCode, body.message)
    return new ApiError(status, UNKNOWN_ERROR, UNKNOWN_ERROR_MESSAGE)
  }

  static network(cause: unknown): ApiError {
    return new ApiError(0, NETWORK_ERROR, NETWORK_ERROR_MESSAGE, { cause })
  }
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.errorCode === 'string' && typeof candidate.message === 'string'
}

/** ApiError 가 아니면 공통 문구를 돌려줌 */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : UNKNOWN_ERROR_MESSAGE
}