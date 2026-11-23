/**
 * 대기열에 직접 등록한 탭만 예매 흐름을 진행할 수 있게 한다
 *
 * 서버의 대기열 상태는 회원 단위라 탭을 복제하거나 새로 열어도 같은 상태가 조회된다
 * 그래서 등록한 탭의 메모리에만 표시를 남긴다
 * sessionStorage는 탭을 복제하면 함께 복사되고 새로고침해도 남아 있어서 쓰지 않는다
 */

let ownedPerformanceId: number | null = null

/**
 * 서버는 회원 단위로 상태를 돌려줘서, 다른 탭이 대기를 새로 시작해도 이 탭은 알 수 없다
 * 그래서 같은 브라우저의 탭끼리 "내가 예매를 가져갔다"를 직접 알린다
 */
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('iseonjwa.queue')
const lostListeners = new Set<() => void>()

channel?.addEventListener('message', () => {
  if (ownedPerformanceId === null) return
  ownedPerformanceId = null
  lostListeners.forEach(listener => listener())
})

/** 이 탭을 예매 주인으로 정하고, 다른 탭에는 예매를 내려놓으라고 알린다 */
export function claimQueue(performanceId: number) {
  ownedPerformanceId = performanceId
  channel?.postMessage('claim')
}

export function releaseQueue() {
  ownedPerformanceId = null
}

export function isQueueOwner(performanceId?: number): boolean {
  if (ownedPerformanceId === null) return false
  return performanceId === undefined || ownedPerformanceId === performanceId
}

/** 다른 탭이 예매를 가져가 이 탭이 주인이 아니게 되면 호출된다 */
export function onQueueLost(listener: () => void): () => void {
  lostListeners.add(listener)
  return () => {
    lostListeners.delete(listener)
  }
}

const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
const reloadedPath = navigation?.type === 'reload' ? window.location.pathname : null

/**
 * 이 화면을 새로고침해서 열었는지 확인한다
 * 탭 복제나 주소 입력으로 열린 화면과 구분하기 위해 쓴다
 */
export function wasReloadedAt(pathname: string): boolean {
  return reloadedPath === pathname
}
