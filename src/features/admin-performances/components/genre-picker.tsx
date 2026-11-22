import type { ReactNode } from 'react'
import { cx } from '../../../utils/cx'
import type { Genre } from '../types'
import './genre-picker.css'

// 등록 화면 타일 문구는 Figma 기준
const GENRE_OPTIONS: { value: Genre; label: string; icon: ReactNode }[] = [
  {
    value: 'K_POP',
    label: 'K-팝',
    icon: <path d="M3 3h7v7h7v8h-7v-3H3V3Zm7 7v5h7" fillRule="evenodd" />,
  },
  {
    value: 'HIPHOP_RANDB',
    label: '힙합/R&B',
    icon: <path d="M3 3h5l4 5 4-5h5l-6 8 6 8h-5l-4-5-4 5H3l6-8-6-8Z" />,
  },
  {
    value: 'VALLAD',
    label: '발라드',
    icon: <path d="M4 20 14 3h4L8 20H4Zm8 0 8-13v5l-5 8h-3Z" />,
  },
  {
    value: 'ETC',
    label: '기타',
    icon: <path d="M10 4h10v7h-7v7H4v-7h6V4Z" />,
  },
]

type GenrePickerProps = {
  name: string
  value: Genre | null
  labelledBy: string
  onChange: (genre: Genre) => void
}

// 라디오 버튼을 타일 모양으로 꾸밈 (키보드 화살표 이동, 스크린리더 지원은 라디오가 그대로 처리)
export function GenrePicker({ name, value, labelledBy, onChange }: GenrePickerProps) {
  return (
    <div className="genre-picker" role="radiogroup" aria-labelledby={labelledBy}>
      {GENRE_OPTIONS.map(option => (
        <label key={option.value} className={cx('genre-option', value === option.value && 'is-selected')}>
          <input
            className="genre-option-input"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {option.icon}
          </svg>
          <span className="genre-option-label">{option.label}</span>
        </label>
      ))}
    </div>
  )
}
