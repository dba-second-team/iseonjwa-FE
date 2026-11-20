import { createBrowserRouter } from 'react-router'
import { RootLayout } from './layouts/RootLayout'
import { HomePage } from './pages/HomePage'
import { RouteErrorPage } from './pages/RouteErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [{ index: true, element: <HomePage /> }],
  },
])