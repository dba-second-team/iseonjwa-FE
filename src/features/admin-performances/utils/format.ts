import type { Genre } from '../types'

const GENRE_LABEL: Record<Genre, string> = {
  K_POP: 'K-POP',
  HIPHOP_RANDB: '힙합/R&B',
  VALLAD: '발라드',
  ETC: '기타',
}

export function formatGenre(genre: Genre): string {
  return GENRE_LABEL[genre] ?? '기타'
}

export function formatTicketCount(count: number): string {
  return `${count.toLocaleString('ko-KR')}매`
}