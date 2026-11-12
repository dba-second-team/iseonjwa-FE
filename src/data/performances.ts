import partyPoster from '../assets/frame-1/secret-party.png'
import enhypenPoster from '../assets/frame-1/enhypen.png'

export type Performance = {
  id: string
  cardTitle: string
  poster: string
  cardDate: string
  cardPrice: string
}

export const performances: Performance[] = [
  {
    id: 'secret-party',
    cardTitle: '비주류초대석 비밀파티',
    poster: partyPoster,
    cardDate: '2026.11.07',
    cardPrice: '48,000원',
  },
  {
    id: 'enhypen',
    cardTitle: 'ENHYPEN WORLD ...',
    poster: enhypenPoster,
    cardDate: '2026.12.08 ~ 2026.12.10',
    cardPrice: '129,000원 ~',
  },
]
