import { createFileRoute } from '@tanstack/react-router'
import AccountConfig from '@views/AccountConfig'

export const Route = createFileRoute('/_auth/manager/account')({
  component: AccountView,
});

function AccountView() {
  const { auth: { user } } = Route.useRouteContext();
  return (
    <AccountConfig userData={user} />
  )
}
