import type { AdminReservation } from '../types'

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

export function formatRoundAndCount(scheduleNumber: number, ticketCount: number): string {
  return `${scheduleNumber}회차 ${ticketCount}매`
}

export function getAmountDetail(reservation: AdminReservation): { label: string; value: string } {
  if (reservation.status === 'REFUNDED') {
    return { label: '환불금액', value: formatPrice(reservation.refundAmount ?? 0) }
  }
  return { label: '총 금액', value: formatPrice(reservation.paidAmount) }
}