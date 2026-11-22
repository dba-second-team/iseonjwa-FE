import type { PaymentStatus } from '../types'

export const STATUS_TABS: { status: PaymentStatus; label: string }[] = [
  { status: 'PAID', label: '예매 완료' },
  { status: 'CANCELED', label: '취소 완료' },
  { status: 'REFUNDED', label: '환불 완료' },
]

export const STATUS_PANEL_ID = 'status-panel'

export function statusTabId(status: PaymentStatus): string {
  return `status-tab-${status}`
}

export function parseStatus(value: string | null): PaymentStatus {
  return STATUS_TABS.find(tab => tab.status === value)?.status ?? 'PAID'
}