import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGoToPage from 'shared/hooks/useGoToPage';

const useLogoutQuery = (): UseMutationResult<unknown> => {
  const { axios, handleResponse } = useBackendAPI();
  const goToPage = useGoToPage();
  const queryClient = useQueryClient();
  return useMutation('logout', () => handleResponse(axios.post(BackendEndpoint.LOGOUT)), {
    onSuccess: () => {
      void queryClient.removeQueries();
      void goToPage('/login?logout=true');
    },
  });
};

export default useLogoutQuery;
