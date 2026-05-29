import { createFileRoute } from '@tanstack/react-router'
import AdminIndex from '@views/admin/AdminIndex'

export const Route = createFileRoute('/_auth/manager/admin/')({
  	component: AdminIndex,
})
