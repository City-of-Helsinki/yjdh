import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useAuth from 'shared/hooks/useAuth';

const useIsOperationPermitted = (): boolean => {
  const { isAuthenticated } = useAuth();
  const {
    isLoading: isLoadingLogout,
    isSuccess: isLoggedOut,
  } = useLogoutQuery();
  return isAuthenticated && !isLoadingLogout && !isLoggedOut;
};
export default useIsOperationPermitted;
