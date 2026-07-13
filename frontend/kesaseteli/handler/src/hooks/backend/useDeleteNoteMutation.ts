import { NoteTargetType } from 'kesaseteli/handler/types/note';
import {
  BackendEndpoint,
  getEmployerApplicationTimelineKey,
  getHandlerNotesQueryKey,
  getYouthApplicationTimelineKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from 'react-query';
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
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries(
        getHandlerNotesQueryKey(targetType, targetId)
      );
      void queryClient.invalidateQueries(
        getYouthApplicationTimelineKey(targetId)
      );
      void queryClient.invalidateQueries(
        getEmployerApplicationTimelineKey(targetId)
      );
      if (onSuccess) {
        void onSuccess(data, variables, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useDeleteNoteMutation;
