export type QueueStatus = 'WAITING' | 'ACTIVE'

/** POST /api/queue/waiting 응답 */
export type WaitingRegistration = {
  performanceId: number
  status: 'WAITING'
  position: number
  enteredAt: string
}

/** GET /api/queue/status 응답 */
export type QueueState = {
  performanceId: number
  status: QueueStatus
  /** 대기 순번(1부터). ACTIVE면 0 */
  position: number
  /** 작업열에 빈자리가 있어 입장할 수 있는지 */
  canEnter: boolean
  /** ACTIVE일 때만 값이 있음 */
  expiresAt: string | null
}
