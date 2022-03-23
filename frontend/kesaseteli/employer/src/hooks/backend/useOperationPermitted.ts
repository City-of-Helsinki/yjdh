import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import useAuth from 'shared/hooks/useAuth';
import useIsRouting from 'shared/hooks/useIsRouting';

const useIsOperationPermitted = (): boolean => {
  const { isAuthenticated } = useAuth();
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();
  const isRouting = useIsRouting();
  return (
    isAuthenticated && userQuery.isSuccess && logoutQuery.isIdle && !isRouting
  );
};
export default useIsOperationPermitted;
