import type { Schedule } from '../types'
import { formatScheduleOption } from '../utils/format'
import './schedule-options.css'

type ScheduleOptionsProps = {
  schedules: Schedule[]
  selectedId: number | null
  onSelect: (scheduleId: number) => void
}

export function ScheduleOptions({ schedules, selectedId, onSelect }: ScheduleOptionsProps) {
  return (
    <fieldset className="schedule-options">
      <legend className="schedule-options-legend">관람할 회차</legend>
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
              onChange={() => onSelect(schedule.scheduleId)}
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
  )
}
