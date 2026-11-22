import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './require-auth'
import { ErrorRoute } from './routes/error'
import { HomeRoute } from './routes/home'
import { LoginRoute } from './routes/login'
import { MyReservationsRoute } from './routes/my-reservations'
import { RootRoute } from './routes/root'
import { SignupRoute } from './routes/signup'

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
        element: <RequireAuth />,
        children: [
          { path: 'my/reservations', element: <MyReservationsRoute /> },
        ],
      },
    ],
  },
])