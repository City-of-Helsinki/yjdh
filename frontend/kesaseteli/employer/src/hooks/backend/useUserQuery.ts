import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { useQuery, UseQueryResult } from 'react-query';
import User from 'shared/types/user';

const useUserQuery = (): UseQueryResult<User, Error> => {
  const { isLoading: isLoadingLogout } = useLogoutQuery();
  return useQuery(`${BackendEndpoint.USER}`, { enabled: !isLoadingLogout });
};
export default useUserQuery;
