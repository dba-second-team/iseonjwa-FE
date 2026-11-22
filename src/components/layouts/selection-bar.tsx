import type { ReactNode } from 'react'
import './selection-bar.css'

type SelectionBarProps = {
  title: ReactNode
  description?: ReactNode
  actionLabel: string
  actionDisabled?: boolean
  loading?: boolean
  onAction: () => void
}

/** 구역 선택, 좌석 선택 화면 아래에 고정되는 선택 요약 + 다음 버튼 */
export function SelectionBar({
  title,
  description,
  actionLabel,
  actionDisabled = false,
  loading = false,
  onAction,
}: SelectionBarProps) {
  return (
    <div className="selection-bar">
      <div className="selection-bar-summary" aria-live="polite">
        <p className="selection-bar-title">{title}</p>
        {description && <p className="selection-bar-description">{description}</p>}
      </div>
      <button
        className="selection-bar-action"
        type="button"
        disabled={actionDisabled || loading}
        aria-busy={loading || undefined}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  )
}
