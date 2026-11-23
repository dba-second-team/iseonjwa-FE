/**
 * 화면 경로를 한곳에서 만들어 오타와 경로 불일치를 막음
 */

function bookingBase(performanceId: number, scheduleId: number) {
  return `/performances/${performanceId}/schedules/${scheduleId}`
}

export const paths = {
  home: () => '/',
  performance: (performanceId: number) => `/performances/${performanceId}`,
  booking: {
    queue: (performanceId: number) => `/performances/${performanceId}/queue`,
    schedules: (performanceId: number) => `/performances/${performanceId}/schedules`,
    sections: (performanceId: number, scheduleId: number) => `${bookingBase(performanceId, scheduleId)}/sections`,
    seats: (performanceId: number, scheduleId: number, section: string) =>
      `${bookingBase(performanceId, scheduleId)}/seats?section=${encodeURIComponent(section)}`,
    confirm: (performanceId: number, scheduleId: number) => `${bookingBase(performanceId, scheduleId)}/confirm`,
  },
  reservationComplete: (reservationId: number) => `/reservations/${reservationId}/complete`,
}
