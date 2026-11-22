import { useRef, type KeyboardEvent } from 'react'
import { cx } from '../../../utils/cx'
import type { PaymentStatus } from '../types'
import { STATUS_PANEL_ID, STATUS_TABS, statusTabId } from '../utils/status'
import './status-tabs.css'

type StatusTabsProps = {
  value: PaymentStatus
  onChange: (status: PaymentStatus) => void
}

export function StatusTabs({ value, onChange }: StatusTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // WAI-ARIA 탭 패턴: 좌우 방향키로 탭 이동
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = STATUS_TABS.findIndex(tab => tab.status === value)
    let next = current
    if (event.key === 'ArrowRight') next = (current + 1) % STATUS_TABS.length
    else if (event.key === 'ArrowLeft') next = (current - 1 + STATUS_TABS.length) % STATUS_TABS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = STATUS_TABS.length - 1
    else return

    event.preventDefault()
    onChange(STATUS_TABS[next].status)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="status-tabs" role="tablist" aria-label="예매 상태" onKeyDown={handleKeyDown}>
      {STATUS_TABS.map((tab, index) => {
        const selected = tab.status === value
        return (
          <button
            key={tab.status}
            ref={element => { tabRefs.current[index] = element }}
            id={statusTabId(tab.status)}
            className={cx('status-tab', selected && 'status-tab-selected')}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={STATUS_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.status)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}