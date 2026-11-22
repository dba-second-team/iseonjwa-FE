function formatDate(date: string): string {
  return date.replaceAll('-', '.')
}

export function formatPeriod(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '일정 미정'
  if (startDate === endDate) return formatDate(startDate)
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
}

export function formatPriceRange(minPrice: number | null, maxPrice: number | null): string {
  if (minPrice === null) return '가격 미정'
  const price = `${minPrice.toLocaleString('ko-KR')}원`
  return maxPrice !== null && maxPrice > minPrice ? `${price} ~` : price
}