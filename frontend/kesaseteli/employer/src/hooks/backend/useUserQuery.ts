import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { useQuery, UseQueryResult } from 'react-query';
import User from 'shared/types/user';

const useUserQuery = (): UseQueryResult<User, Error> => {
  const { isLoading: isLoadingLogout } = useLogoutQuery();
  const { axios, handleResponse } = useBackendAPI();
  return useQuery(
    'user',
    () => handleResponse<User>(axios.get(BackendEndpoint.USER)),
    { enabled: !isLoadingLogout }
  );
};
export default useUserQuery;
