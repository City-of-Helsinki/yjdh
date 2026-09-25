import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import EmployerCompleteOperation from 'kesaseteli/handler/types/employer-complete-operation';
import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import {
  BackendEndpoint,
  getEmployerApplicationQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useCompleteEmployerApplicationQuery = (
  id: HandlerEmployerApplication['id'],
  options?: UseMutationOptions<
    HandlerEmployerApplication,
    unknown,
    EmployerCompleteOperation
  >
): UseMutationResult<
  HandlerEmployerApplication,
  unknown,
  EmployerCompleteOperation
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: ({ type }) =>
      handleResponse<HandlerEmployerApplication>(
        axios.patch(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/${type}/`)
      ),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationQueryKey(id)],
      });
      if (onSuccess) {
        void onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCompleteEmployerApplicationQuery;
