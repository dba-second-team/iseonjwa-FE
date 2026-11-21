import type { ComponentProps } from 'react'
import { cx } from '../utils/cx'
import './Button.css'

type ButtonProps = ComponentProps<'button'> & {
  loading?: boolean
}

export function Button({ type = 'button', loading = false, disabled, className, ...buttonProps }: ButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      className={cx('button', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    />
  )
}