import {
  BackendEndpoint,
  getYouthApplicationQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

type Operation = 'accept' | 'reject';

const useCompleteYouthApplicationQuery = (
  id: CreatedYouthApplication['id'],
  options?: UseMutationOptions<CreatedYouthApplication, unknown, Operation>
): UseMutationResult<CreatedYouthApplication, unknown, Operation> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: (operation: Operation) =>
      handleResponse<CreatedYouthApplication>(
        axios.patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${operation}/`)
      ),
    onSuccess: (data, operation, context) => {
      void queryClient.invalidateQueries(getYouthApplicationQueryKey(id));
      if (onSuccess) {
        void onSuccess(data, operation, context);
      }
    },
    onError: useErrorHandler(false),
    ...restOptions,
  });
};

export default useCompleteYouthApplicationQuery;
