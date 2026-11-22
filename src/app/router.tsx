import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './require-auth'
import { ErrorRoute } from './routes/error'
import { HomeRoute } from './routes/home'
import { LoginRoute } from './routes/login'
import { MyReservationsRoute } from './routes/my-reservations'
import { RootRoute } from './routes/root'
import { SignupRoute } from './routes/signup'
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
      { path: 'admin/login', element: <LoginRoute key="admin" mode="admin" /> },
      {
        element: <RequireAdmin />,
        children: [
          { path: 'admin/performances', element: <AdminPerformancesRoute /> },
          { path: 'admin/performances/:performanceId/reservations', element: <AdminReservationsRoute /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'my/reservations', element: <MyReservationsRoute /> },
        ],
      },
    ],
  },
])