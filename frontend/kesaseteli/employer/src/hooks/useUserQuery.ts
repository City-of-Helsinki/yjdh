import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import { useQuery, UseQueryResult } from 'react-query';
import User from 'shared/types/user';

const useUserQuery = (): UseQueryResult<User, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<User, Error>('user', () =>
    handleResponse<User>(axios.get(backendEndpoint.user))
  );
};
export default useUserQuery;
