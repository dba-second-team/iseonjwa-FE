import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './require-auth'
import { BookingConfirmRoute } from './routes/booking-confirm'
import { BookingQueueRoute } from './routes/booking-queue'
import { BookingSeatsRoute } from './routes/booking-seats'
import { BookingSectionsRoute } from './routes/booking-sections'
import { ErrorRoute } from './routes/error'
import { HomeRoute } from './routes/home'
import { LoginRoute } from './routes/login'
import { MyReservationsRoute } from './routes/my-reservations'
import { PerformanceDetailRoute } from './routes/performance-detail'
import { ReservationCompleteRoute } from './routes/reservation-complete'
import { RootRoute } from './routes/root'
import { SignupRoute } from './routes/signup'
import { AdminPerformanceNewRoute } from './routes/admin-performance-new'
import { AdminPerformancesRoute } from './routes/admin-performances'
import { AdminReservationsRoute } from './routes/admin-reservations'
import { RequireAdmin } from './require-admin'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
    errorElement: <ErrorRoute />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'login', element: <LoginRoute /> },
      { path: 'signup', element: <SignupRoute /> },
      { path: 'performances/:performanceId', element: <PerformanceDetailRoute /> },
      { path: 'admin/login', element: <LoginRoute key="admin" mode="admin" /> },
      {
        element: <RequireAdmin />,
        children: [
          { path: 'admin/performances', element: <AdminPerformancesRoute /> },
          { path: 'admin/performances/new', element: <AdminPerformanceNewRoute /> },
          { path: 'admin/performances/:performanceId/reservations', element: <AdminReservationsRoute /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'my/reservations', element: <MyReservationsRoute /> },
          { path: 'performances/:performanceId/schedules/:scheduleId/queue', element: <BookingQueueRoute /> },
          { path: 'performances/:performanceId/schedules/:scheduleId/sections', element: <BookingSectionsRoute /> },
          { path: 'performances/:performanceId/schedules/:scheduleId/seats', element: <BookingSeatsRoute /> },
          { path: 'performances/:performanceId/schedules/:scheduleId/confirm', element: <BookingConfirmRoute /> },
          { path: 'reservations/:reservationId/complete', element: <ReservationCompleteRoute /> },
        ],
      },
    ],
  },
])