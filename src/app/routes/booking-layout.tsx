import { Outlet } from 'react-router'
import { useLeaveQueueOnExit } from '../../features/queue/hooks/use-leave-queue-on-exit'

export function BookingLayout() {
  useLeaveQueueOnExit()
  return <Outlet />
}
