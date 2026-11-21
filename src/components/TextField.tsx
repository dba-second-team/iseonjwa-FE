import { useId, type ComponentProps } from 'react'
import { cx } from '../utils/cx'          // ← 추가
import './TextField.css'

type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string
  error?: string
}

export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="text-field">
      <label className="text-field-label" htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        id={id}
        className={cx('text-field-input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <p id={errorId} className="text-field-error">{error}</p>}
    </div>
  )
}