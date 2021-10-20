import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';

const useIsOperationPermitted = (): boolean => {
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();
  return userQuery.isSuccess && logoutQuery.isIdle;
};
export default useIsOperationPermitted;
