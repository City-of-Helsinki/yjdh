import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import useAuth from 'shared/hooks/useAuth';
import useIsRouting from 'shared/hooks/useIsRouting';

const useIsOperationPermitted = (): boolean => {
  const { isAuthenticated } = useAuth();
  const userQuery = useUserQuery();
  const isRouting = useIsRouting();
  return isAuthenticated && userQuery.isSuccess && !isRouting;
};
export default useIsOperationPermitted;
