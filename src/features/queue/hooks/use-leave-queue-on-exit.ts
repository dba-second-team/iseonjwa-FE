import { useEffect, useRef } from 'react'
import { getAuthUser } from '../../../lib/auth'
import { leaveQueue } from '../api/leave-queue'

/**
 * 앱 안에서 예매 흐름(대기열부터 예매 확인까지)을 벗어나면 대기열과 예매 작업열에서 바로 빠진다
 *
 * 새로고침도 pagehide가 발생해 탭 닫기와 구분할 수 없으므로 여기서는 언마운트에서만 호출한다
 * 작업열에 들어간 뒤 탭을 닫으면 서버의 작업열 만료 시간(10분)이 지나 빠진다
 * 실패해도 만료 시간이 지나면 빠지므로 에러는 무시한다
 */
export function useLeaveQueueOnExit() {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    // 로그아웃으로 화면을 벗어나는 경우에도 보낼 수 있게 들어올 때의 회원 ID를 기억
    const memberId = getAuthUser()?.memberId
    if (memberId === undefined) return

    return () => {
      mountedRef.current = false

      // StrictMode 개발 모드는 언마운트 직후 바로 다시 마운트하므로, 그 경우에는 보내지 않음
      queueMicrotask(() => {
        if (!mountedRef.current) {
          leaveQueue({ headers: { 'X-Member-Id': String(memberId) } }).catch(() => {})
        }
      })
    }
  }, [])
}
