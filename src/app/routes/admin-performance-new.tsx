import { useNavigate } from 'react-router'
import { BackHeader } from '../../components/layouts/back-header'
import { PerformanceForm } from '../../features/admin-performances/components/performance-form'
import './admin-performance-new.css'

export function AdminPerformanceNewRoute() {
  const navigate = useNavigate()

  return (
    <main className="page admin-performance-new-page">
      <BackHeader fallbackTo="/admin/performances" title="공연 등록하기" />
      {/* 등록 후 뒤로 가기로 폼에 다시 오지 않도록 replace */}
      <PerformanceForm onSuccess={() => navigate('/admin/performances', { replace: true })} />
    </main>
  )
}
