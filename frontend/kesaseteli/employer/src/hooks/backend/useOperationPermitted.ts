import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import useAuth from 'shared/hooks/useAuth';

const useIsOperationPermitted = (): boolean => {
  const { isAuthenticated } = useAuth();
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();
  return isAuthenticated && userQuery.isSuccess && logoutQuery.isIdle;
};
export default useIsOperationPermitted;
