import { useEffect } from 'react'
import { getAuthUser } from '../../../lib/auth'
import { leaveQueue } from '../api/leave-queue'

/**
 * 대기 중에 탭을 닫거나 다른 사이트로 이동하면 대기열에서 빠진다
 *
 * 대기열은 서버 만료 시간이 없어서, 나간 사람이 앞 순번에 남으면 뒷사람이 입장하지 못한다
 * 그래서 대기 화면에서만 pagehide에 호출한다 (새로고침하면 순번이 뒤로 밀린다)
 */
export function useLeaveQueueOnPageHide(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const memberId = getAuthUser()?.memberId
    if (memberId === undefined) return

    // 페이지가 내려가는 중에도 요청이 끝까지 전송되도록 keepalive
    const onPageHide = () => {
      leaveQueue({ headers: { 'X-Member-Id': String(memberId) }, keepalive: true }).catch(() => {})
    }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [enabled])
}
