import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useLogoutQuery = (): UseMutationResult<unknown, Error, void> => {
  const { axios } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>(
    'logout',
    () =>
      handleResponse(
        axios.post<unknown>(backendEndpoint.LOGOUT, undefined, {
          withCredentials: true,
        })
      ),
    {
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log('Error on logout', error);
        void queryClient.removeQueries();
        void router.push('/login?error=true');
      },
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
