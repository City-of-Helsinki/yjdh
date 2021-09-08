import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useAuth from 'shared/hooks/useAuth';

const useIsOperationPermitted = (): boolean => {
  const { isAuthenticated } = useAuth();
  const {
    isLoading: isLoadingLogout,
    isSuccess: isLogoutSucceeded,
  } = useLogoutQuery();
  return isAuthenticated && !isLoadingLogout && !isLogoutSucceeded;
};
export default useIsOperationPermitted;
