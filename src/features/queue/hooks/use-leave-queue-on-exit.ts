import { useEffect, useRef } from 'react'
import { getAuthUser } from '../../../lib/auth'
import { leaveQueue } from '../api/leave-queue'

/**
 * 예매 흐름(대기열부터 예매 확인까지)을 벗어나면 대기열과 예매 작업열에서 바로 빠진다
 *
 * 탭을 닫거나 다른 사이트로 이동하면 pagehide에서, 앱 안에서 다른 화면으로 가면 언마운트에서 호출한다
 * 실패해도 서버의 만료 시간이 지나면 빠지므로 에러는 무시한다
 */
export function useLeaveQueueOnExit() {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    // 로그아웃으로 화면을 벗어나는 경우에도 보낼 수 있게 들어올 때의 회원 ID를 기억
    const memberId = getAuthUser()?.memberId
    if (memberId === undefined) return

    const headers = { 'X-Member-Id': String(memberId) }
    const leave = (keepalive: boolean) => {
      leaveQueue({ headers, keepalive }).catch(() => {})
    }

    // 페이지가 내려가는 중에도 요청이 끝까지 전송되도록 keepalive
    const onPageHide = () => leave(true)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      mountedRef.current = false
      window.removeEventListener('pagehide', onPageHide)

      // StrictMode 개발 모드는 언마운트 직후 바로 다시 마운트하므로, 그 경우에는 보내지 않음
      queueMicrotask(() => {
        if (!mountedRef.current) leave(false)
      })
    }
  }, [])
}
