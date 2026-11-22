/** URL 파라미터 같은 문자열을 양의 정수 ID로 바꾸고, 아니면 null */
export function parseId(value: string | undefined | null): number | null {
  if (!value) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
