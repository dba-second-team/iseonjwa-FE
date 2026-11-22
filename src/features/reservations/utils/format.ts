const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
})

export function formatDate(isoDateTime: string): string {
  return dateFormatter.format(new Date(isoDateTime))
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function formatRoundAndCount(round: number | null | undefined, seatCount: number): string {
  const count = `${seatCount}매`
  return round ? `${round}회차 ${count}` : count
  // TODO : return `${round}회차 ${seatCount}매`
}