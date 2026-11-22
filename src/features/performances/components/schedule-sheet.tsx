import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../../components/ui/button'
import type { Schedule } from '../types'
import { formatScheduleOption } from '../utils/format'
import './schedule-sheet.css'

type ScheduleSheetProps = {
  schedules: Schedule[]
  onSelect: (schedule: Schedule) => void
  onClose: () => void
}

export function ScheduleSheet({ schedules, onSelect, onClose }: ScheduleSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // 회차가 하나뿐이면 고를 게 없으니 미리 선택
  const [selectedId, setSelectedId] = useState<number | null>(
    schedules.length === 1 ? schedules[0].scheduleId : null,
  )

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const selected = schedules.find(schedule => schedule.scheduleId === selectedId)

  return (
    <dialog
      ref={ref}
      className="schedule-sheet"
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      // 시트 바깥(배경)을 누르면 닫힘
      onClick={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="schedule-sheet-body">
        <h2 id={titleId} className="schedule-sheet-title">회차 선택</h2>
        <fieldset className="schedule-sheet-options">
          <legend className="schedule-sheet-legend">관람할 회차를 선택해 주세요</legend>
          {schedules.map(schedule => {
            const { date, time } = formatScheduleOption(schedule.startAt)
            return (
              <label key={schedule.scheduleId} className="schedule-option">
                <input
                  className="schedule-option-input"
                  type="radio"
                  name="schedule"
                  value={schedule.scheduleId}
                  checked={schedule.scheduleId === selectedId}
                  onChange={() => setSelectedId(schedule.scheduleId)}
                />
                <span className="schedule-option-text">
                  {schedule.round}회차 {date}
                  <span className="schedule-option-divider" aria-hidden="true">|</span>
                  {time}
                </span>
                <span className="schedule-option-radio" aria-hidden="true" />
              </label>
            )
          })}
        </fieldset>
        <Button disabled={!selected} onClick={() => selected && onSelect(selected)}>
          예매하기
        </Button>
      </div>
    </dialog>
  )
}