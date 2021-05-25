import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import { useMutation, UseMutationResult } from 'react-query';

const useLogoutQuery = (): UseMutationResult<unknown, Error, void> => {
  const { axios } = useBackendAPI();
  return useMutation<unknown, Error, void>('logout', () =>
    handleResponse(
      axios.post<unknown>(backendEndpoint.LOGOUT, undefined, {
        withCredentials: true,
      })
    )
  );
};

export default useLogoutQuery;
