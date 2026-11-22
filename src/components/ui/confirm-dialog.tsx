import { useEffect, useRef } from 'react'
import './confirm-dialog.css'

type ConfirmDialogProps = {
  title: string
  description?: string
  cancelLabel?: string
  confirmLabel: string
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  title,
  description,
  cancelLabel = '아니요',
  confirmLabel,
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  function close() {
    if (!loading) onClose()
  }

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? 'confirm-dialog-description' : undefined}
      onCancel={event => {
        event.preventDefault()
        close()
      }}
    >
      <h2 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h2>
      {description && <p id="confirm-dialog-description" className="confirm-dialog-description">{description}</p>}
      {error && <p className="confirm-dialog-error" role="alert">{error}</p>}
      <div className="confirm-dialog-actions">
        <button className="confirm-dialog-button" type="button" disabled={loading} onClick={close}>
          {cancelLabel}
        </button>
        <button
          className="confirm-dialog-button confirm-dialog-confirm"
          type="button"
          disabled={loading}
          aria-busy={loading || undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}