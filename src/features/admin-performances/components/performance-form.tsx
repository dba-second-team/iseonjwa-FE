import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/button'
import { ApiError, getErrorMessage } from '../../../lib/api-error'
import { cx } from '../../../utils/cx'
import { createPerformance } from '../api/create-performance'
import type { CreatePerformanceResponse, Genre, SeatSection } from '../types'
import {
  DESCRIPTION_MAX_LENGTH,
  formatPriceInput,
  INITIAL_VALUES,
  isFilled,
  MAX_SCHEDULE_COUNT,
  MAX_TICKETS_LIMIT,
  resizeSchedules,
  SEAT_SECTIONS,
  TITLE_MAX_LENGTH,
  toDateTimeLocal,
  toDigits,
  toRequest,
  validate,
  VENUE_MAX_LENGTH,
  type PerformanceFormErrors,
  type PerformanceFormField,
  type PerformanceFormValues,
} from '../utils/performance-form'
import { CountStepper } from './count-stepper'
import { GenrePicker } from './genre-picker'
import { PosterField } from './poster-field'
import './performance-form.css'

const PRICE_MAX_DIGITS = 9
const RUNNING_TIME_MAX_DIGITS = 4

type PerformanceFormProps = {
  onSuccess: (result: CreatePerformanceResponse) => void
}

export function PerformanceForm({ onSuccess }: PerformanceFormProps) {
  const id = useId()
  const [values, setValues] = useState<PerformanceFormValues>(INITIAL_VALUES)
  const [poster, setPoster] = useState<File | null>(null)
  const [errors, setErrors] = useState<PerformanceFormErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // 달력에서 지난 시간을 고르지 않도록 화면을 연 시각을 최소값으로 씀 (정확한 검증은 제출 시 validate)
  const [minDateTime] = useState(() => toDateTimeLocal(new Date()))

  const canSubmit = isFilled(values) && !isSubmitting

  function update<K extends keyof PerformanceFormValues>(
    key: K,
    value: PerformanceFormValues[K],
    errorField: PerformanceFormField = key as PerformanceFormField,
  ) {
    setValues(prev => ({ ...prev, [key]: value }))
    clearError(errorField)
  }

  function clearError(field: PerformanceFormField) {
    setErrors(prev => ({ ...prev, [field]: undefined }))
    setFormError('')
  }

  function changeScheduleCount(count: number) {
    update('schedules', resizeSchedules(values.schedules, count))
  }

  function changeSchedule(index: number, value: string) {
    update('schedules', values.schedules.map((schedule, i) => (i === index ? value : schedule)))
  }

  function changePrice(section: SeatSection, value: string) {
    update('prices', { ...values.prices, [section]: toDigits(value, PRICE_MAX_DIGITS) })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    const fieldErrors = validate(values)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    setFormError('')
    try {
      const result = await createPerformance(toRequest(values), poster)
      onSuccess(result)
    } catch (error) {
      handleSubmitError(error)
      setIsSubmitting(false)
    }
  }

  function handleSubmitError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.code === 'SCHEDULE_CONFLICT') {
        setErrors(prev => ({ ...prev, schedules: '같은 공연장에 시간이 겹치는 회차가 있어요.' }))
        return
      }
      // 413은 서버(POSTER_TOO_LARGE)나 앞단 프록시의 업로드 용량 제한
      if (error.code === 'POSTER_TOO_LARGE' || error.status === 413) {
        setErrors(prev => ({ ...prev, poster: '포스터 파일은 5MB 이하로 등록해 주세요.' }))
        return
      }
    }
    setFormError(getErrorMessage(error))
  }

  return (
    <form className="performance-form" noValidate onSubmit={handleSubmit}>
      <Section title="공연 포스터" description="한 장만 등록 가능해요.">
        <PosterField
          error={errors.poster}
          onChange={file => {
            setPoster(file)
            clearError('poster')
          }}
          onError={message => setErrors(prev => ({ ...prev, poster: message }))}
        />
      </Section>

      <Section title="공연 장르" titleId={`${id}-genre`} error={errors.genre}>
        <GenrePicker
          name="genre"
          labelledBy={`${id}-genre`}
          value={values.genre}
          onChange={(genre: Genre) => update('genre', genre)}
        />
      </Section>

      <Section title="공연명" htmlFor={`${id}-title`} error={errors.title} errorId={`${id}-title-error`}>
        <input
          id={`${id}-title`}
          className="performance-input"
          name="title"
          maxLength={TITLE_MAX_LENGTH}
          placeholder="등록할 공연의 이름을 입력해주세요."
          value={values.title}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? `${id}-title-error` : undefined}
          onChange={event => update('title', event.target.value)}
        />
        <p className="performance-counter">{values.title.length}/{TITLE_MAX_LENGTH}</p>
      </Section>

      <Section title="공연장 이름" htmlFor={`${id}-venue`} error={errors.venueName} errorId={`${id}-venue-error`}>
        <input
          id={`${id}-venue`}
          className="performance-input"
          name="venueName"
          maxLength={VENUE_MAX_LENGTH}
          placeholder="ex) 인스파이어 아레나, 고양종합운동장"
          value={values.venueName}
          aria-invalid={errors.venueName ? true : undefined}
          aria-describedby={errors.venueName ? `${id}-venue-error` : undefined}
          onChange={event => update('venueName', event.target.value)}
        />
      </Section>

      <Section title="공연 소개" htmlFor={`${id}-description`}>
        <textarea
          id={`${id}-description`}
          className="performance-input performance-textarea"
          name="description"
          maxLength={DESCRIPTION_MAX_LENGTH}
          placeholder="예매자들에게 공연을 소개해주세요."
          value={values.description}
          onChange={event => setValues(prev => ({ ...prev, description: event.target.value }))}
        />
        <p className="performance-counter">{values.description.length}/{DESCRIPTION_MAX_LENGTH}</p>
      </Section>

      <Section title="러닝 타임" htmlFor={`${id}-running-time`} error={errors.runningTime} errorId={`${id}-running-time-error`}>
        <SuffixInput suffix="분">
          <input
            id={`${id}-running-time`}
            className="performance-input"
            name="runningTime"
            inputMode="numeric"
            placeholder="분 단위로 입력해주세요."
            value={values.runningTime}
            aria-invalid={errors.runningTime ? true : undefined}
            aria-describedby={errors.runningTime ? `${id}-running-time-error` : undefined}
            onChange={event => update('runningTime', toDigits(event.target.value, RUNNING_TIME_MAX_DIGITS))}
          />
        </SuffixInput>
      </Section>

      <Section
        title="회차 수"
        badge={`최대 ${MAX_SCHEDULE_COUNT}회차`}
        notice="이후 회차 수정은 할 수 없어요."
        action={
          <CountStepper
            label="회차 수"
            value={values.schedules.length}
            min={1}
            max={MAX_SCHEDULE_COUNT}
            onChange={changeScheduleCount}
          />
        }
      />

      <Section
        title="예매 매수 제한"
        notice="한 사람당 최대 예매 가능 매수를 지정해 주세요."
        action={
          <CountStepper
            label="예매 매수 제한"
            value={values.maxTicketsPerMember}
            min={1}
            max={MAX_TICKETS_LIMIT}
            onChange={count => setValues(prev => ({ ...prev, maxTicketsPerMember: count }))}
          />
        }
      />

      <Section title="회차별 시간대" error={errors.schedules} errorId={`${id}-schedules-error`}>
        <div className="performance-sub-fields">
          {values.schedules.map((schedule, index) => (
            <ScheduleInput
              key={index}
              id={`${id}-schedule-${index}`}
              label={`${index + 1}회차`}
              min={minDateTime}
              value={schedule}
              invalid={Boolean(errors.schedules)}
              describedBy={errors.schedules ? `${id}-schedules-error` : undefined}
              onChange={value => changeSchedule(index, value)}
            />
          ))}
        </div>
      </Section>

      <Section title="티켓 가격" error={errors.prices} errorId={`${id}-prices-error`}>
        <div className="performance-sub-fields">
          {SEAT_SECTIONS.map(section => (
            <div key={section} className="performance-sub-field">
              <label className="performance-sub-label" htmlFor={`${id}-price-${section}`}>{section}석</label>
              <SuffixInput suffix="원">
                <input
                  id={`${id}-price-${section}`}
                  className="performance-input"
                  name={`price-${section}`}
                  inputMode="numeric"
                  placeholder="가격을 입력해주세요."
                  value={formatPriceInput(values.prices[section])}
                  aria-invalid={errors.prices && values.prices[section] === '' ? true : undefined}
                  aria-describedby={errors.prices ? `${id}-prices-error` : undefined}
                  onChange={event => changePrice(section, event.target.value)}
                />
              </SuffixInput>
            </div>
          ))}
        </div>
      </Section>

      <div className="performance-form-bottom">
        {formError && <p className="performance-form-error" role="alert">{formError}</p>}
        <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
          {isSubmitting ? '등록하는 중...' : '등록 완료하기'}
        </Button>
      </div>
    </form>
  )
}

type SectionProps = {
  title: string
  titleId?: string
  htmlFor?: string
  description?: string
  badge?: string
  notice?: string
  action?: ReactNode
  error?: string
  errorId?: string
  children?: ReactNode
}

function Section({ title, titleId, htmlFor, description, badge, notice, action, error, errorId, children }: SectionProps) {
  const heading = htmlFor ? <label htmlFor={htmlFor}>{title}</label> : title

  return (
    <section className="performance-section">
      <div className={cx('performance-section-head', action !== undefined && 'has-action')}>
        <div>
          <h2 id={titleId} className="performance-section-title">
            {heading}
            {badge && <span className="performance-section-badge">{badge}</span>}
          </h2>
          {description && <p className="performance-section-description">{description}</p>}
        </div>
        {action}
      </div>
      {notice && (
        <p className="performance-notice">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill="currentColor" />
            <path d="M8 4v5M8 11.5v.5" stroke="#1b1b1b" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {notice}
        </p>
      )}
      {children && <div className="performance-section-body">{children}</div>}
      {error && <p id={errorId} className="performance-error" role="alert">{error}</p>}
    </section>
  )
}

function SuffixInput({ suffix, children }: { suffix: string; children: ReactNode }) {
  return (
    <div className="performance-suffix-input">
      {children}
      <span className="performance-suffix" aria-hidden="true">{suffix}</span>
    </div>
  )
}

type ScheduleInputProps = {
  id: string
  label: string
  min: string
  value: string
  invalid: boolean
  describedBy?: string
  onChange: (value: string) => void
}

function ScheduleInput({ id, label, min, value, invalid, describedBy, onChange }: ScheduleInputProps) {
  function openPicker(input: HTMLInputElement) {
    // 지원하지 않는 브라우저는 기본 동작(직접 입력)으로 둠
    try {
      input.showPicker()
    } catch {
      input.focus()
    }
  }

  return (
    <div className="performance-sub-field">
      <label className="performance-sub-label" htmlFor={id}>{label}</label>
      <div className={cx('performance-date-input', value === '' && 'is-empty')}>
        <input
          id={id}
          className="performance-input"
          type="datetime-local"
          min={min}
          value={value}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          onClick={event => openPicker(event.currentTarget)}
          onChange={event => onChange(event.target.value)}
        />
        {/* datetime-local은 placeholder를 지원하지 않아 값이 없을 때만 문구를 덮어씌움 */}
        <span className="performance-date-placeholder" aria-hidden="true">날짜와 시간을 선택해주세요</span>
        <svg className="performance-date-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
        </svg>
      </div>
    </div>
  )
}
