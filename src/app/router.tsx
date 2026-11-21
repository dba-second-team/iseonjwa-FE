import { createBrowserRouter } from 'react-router'
import { ErrorRoute } from './routes/error'
import { HomeRoute } from './routes/home'
import { LoginRoute } from './routes/login'
import { RootRoute } from './routes/root'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />,
    errorElement: <ErrorRoute />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'login', element: <LoginRoute /> },
      { path: 'admin/login', element: <LoginRoute key="admin" mode="admin" /> },
    ],
  },
])
