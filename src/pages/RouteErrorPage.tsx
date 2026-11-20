import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import './RouteErrorPage.css'

export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  if (!notFound) console.error(error)

  return (
    <main className="page route-error-page">
      <h1 className="route-error-title">
        {notFound ? '페이지를 찾을 수 없어요.' : '문제가 생겼어요.'}
      </h1>
      <p className="route-error-description">
        {notFound ? '주소가 맞는지 확인해 주세요.' : '잠시 후 다시 시도해 주세요.'}
      </p>
      <Link className="route-error-link" to="/">
        홈으로 가기
      </Link>
    </main>
  )
}