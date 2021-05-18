import backendEndpoint from 'employer/backend-api/backend-endpoints';
import handleResponse from 'employer/backend-api/handle-response';
import useBackendAPI from 'employer/hooks/useBackendAPI';
import User from 'employer/types/user';
import { useQuery, UseQueryResult } from 'react-query';

const useUserQuery = (): UseQueryResult<User, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<User, Error>('user', () =>
    handleResponse(axios.get<User>(backendEndpoint.USER))
  );
};
export default useUserQuery;
