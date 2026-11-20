export type ApiResponse<T> = {
  data: T
}

export type ErrorResponse = {
  errorCode: string
  message: string
}