import { createBrowserRouter } from 'react-router'
import { RootLayout } from './layouts/RootLayout'
import { HomePage } from './pages/HomePage'
import { RouteErrorPage } from './pages/RouteErrorPage'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'admin/login', element: <LoginPage key="admin" mode="admin" /> },
    ],
  },
])