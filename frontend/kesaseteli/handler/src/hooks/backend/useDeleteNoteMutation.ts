import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  BackendEndpoint,
  getEmployerApplicationTimelineKey,
  getHandlerNotesQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useDeleteNoteMutation = (
  targetType: NoteTargetType,
  targetId: string,
  options?: UseMutationOptions<void, unknown, string>
): UseMutationResult<void, unknown, string> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (noteId: string) =>
      handleResponse<void>(
        axios.delete(`${BackendEndpoint.HANDLER_NOTES}${noteId}/`)
      ),
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: [getHandlerNotesQueryKey(targetType, targetId)],
      });
      void queryClient.invalidateQueries({
        queryKey: [getYouthApplicationTimelineKey(targetId)],
      });
      void queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationTimelineKey(targetId)],
      });
      if (onSuccess) {
        void onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useDeleteNoteMutation;
