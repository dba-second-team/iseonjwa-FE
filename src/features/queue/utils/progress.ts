/**
 * 진행 바는 "처음 받은 순번 대비 얼마나 줄었는지"로 그림.
 * 새로고침해도 진행 바가 처음으로 돌아가지 않게 처음 순번을 sessionStorage에 둠.
 */

const KEY_PREFIX = 'iseonjwa.queue.initial-position.'

function readInitial(performanceId: number): number | null {
  try {
    const value = Number(sessionStorage.getItem(KEY_PREFIX + performanceId))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

function writeInitial(performanceId: number, position: number) {
  try {
    sessionStorage.setItem(KEY_PREFIX + performanceId, String(position))
  } catch {
    // 저장이 막혀도 진행 바만 부정확해질 뿐이라 무시
  }
}

export function clearInitialPosition(performanceId: number) {
  try {
    sessionStorage.removeItem(KEY_PREFIX + performanceId)
  } catch {
    // 무시
  }
}

/** 0~1 사이 진행률. 처음 순번보다 큰 순번이 오면 그 값을 새 기준으로 삼음 */
export function getQueueProgress(performanceId: number, position: number): number {
  const saved = readInitial(performanceId)
  const initial = saved !== null && saved >= position ? saved : position
  if (initial !== saved) writeInitial(performanceId, initial)
  return (initial - position + 1) / initial
}
