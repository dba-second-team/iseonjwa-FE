import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { POSTER_ACCEPT, POSTER_MAX_BYTES } from '../utils/performance-form'
import './poster-field.css'

type PosterFieldProps = {
  error?: string
  onChange: (file: File | null) => void
  onError: (message: string) => void
}

export function PosterField({ error, onChange, onError }: PosterFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  // 미리보기 URL은 메모리를 잡고 있으므로 바꾸거나 화면을 나갈 때 해제
  function replacePreview(file: File | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = file ? URL.createObjectURL(file) : null
    previewUrlRef.current = url
    setPreviewUrl(url)
  }

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    // 같은 파일을 다시 골라도 change 이벤트가 나도록 비움
    event.target.value = ''
    if (!selected) return

    if (!POSTER_ACCEPT.split(',').includes(selected.type)) {
      onError('JPG, PNG 이미지만 등록할 수 있어요.')
      return
    }
    if (selected.size > POSTER_MAX_BYTES) {
      onError('포스터 파일은 5MB 이하로 등록해 주세요.')
      return
    }
    replacePreview(selected)
    onChange(selected)
  }

  return (
    <div className="poster-field">
      <input
        ref={inputRef}
        id={id}
        className="poster-field-input"
        type="file"
        accept={POSTER_ACCEPT}
        aria-describedby={`${id}-hint`}
        onChange={handleChange}
      />

      {previewUrl ? (
        <div className="poster-field-preview">
          <img className="poster-field-image" src={previewUrl} alt="선택한 공연 포스터" />
          <button
            className="poster-field-remove"
            type="button"
            aria-label="포스터 삭제"
            onClick={() => {
              replacePreview(null)
              onChange(null)
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="poster-field-box" htmlFor={id}>
          <span className="visually-hidden">공연 포스터 선택</span>
          <svg width="20" height="18" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 7a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </label>
      )}

      <p id={`${id}-hint`} className="visually-hidden">JPG, PNG 이미지 5MB 이하 한 장</p>
      {error && <p className="poster-field-error" role="alert">{error}</p>}
    </div>
  )
}
