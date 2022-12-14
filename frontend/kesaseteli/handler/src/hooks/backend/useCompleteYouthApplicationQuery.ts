import CompleteOperation from 'kesaseteli/handler/types/complete-operation';
import {
  BackendEndpoint,
  getYouthApplicationQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useCompleteYouthApplicationQuery = (
  id: ActivatedYouthApplication['id'],
  options?: UseMutationOptions<
    ActivatedYouthApplication,
    unknown,
    CompleteOperation
  >
): UseMutationResult<ActivatedYouthApplication, unknown, CompleteOperation> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: ({ type, encrypted_handler_vtj_json }) =>
      handleResponse<ActivatedYouthApplication>(
        axios.patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${type}/`, {
          encrypted_handler_vtj_json,
        })
      ),
    onSuccess: (data, operation, context) => {
      void queryClient.invalidateQueries(getYouthApplicationQueryKey(id));
      if (onSuccess) {
        void onSuccess(data, operation, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCompleteYouthApplicationQuery;
