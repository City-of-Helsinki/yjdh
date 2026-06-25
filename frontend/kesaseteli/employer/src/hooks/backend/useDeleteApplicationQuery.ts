import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useDeleteApplicationQuery = (): UseMutationResult<
  void,
  unknown,
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [BackendEndpoint.EMPLOYER_APPLICATIONS],
    mutationFn: (id: string) =>
      handleResponse<void>(
        axios.delete(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/`)
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (typeof key === 'string') {
            return (key as string).startsWith(
              BackendEndpoint.EMPLOYER_APPLICATIONS
            );
          }
          if (Array.isArray(key) && typeof key[0] === 'string') {
            return key[0].startsWith(BackendEndpoint.EMPLOYER_APPLICATIONS);
          }
          return false;
        },
      });
    },
  });
};

export default useDeleteApplicationQuery;
