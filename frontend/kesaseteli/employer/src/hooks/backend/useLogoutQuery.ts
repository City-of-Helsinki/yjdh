import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGoToPage from 'shared/hooks/useGoToPage';

const useLogoutQuery = (): UseMutationResult<unknown> => {
  const { axios, handleResponse } = useBackendAPI();
  const goToPage = useGoToPage();
  const queryClient = useQueryClient();
  return useMutation(
    'logout',
    () => handleResponse(axios.post(BackendEndpoint.LOGOUT)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        clearLocalStorage('application');
        void goToPage('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
