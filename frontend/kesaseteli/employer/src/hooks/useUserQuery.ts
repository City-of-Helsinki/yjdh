import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import { useQuery, UseQueryResult } from 'react-query';
import User from 'shared/types/user';

const useUserQuery = (): UseQueryResult<User, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<User, Error>('user', () =>
    handleResponse<User>(axios.get(BackendEndpoint.USER))
  );
};
export default useUserQuery;
