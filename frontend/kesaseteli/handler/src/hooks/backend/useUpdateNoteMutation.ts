import {
  HandlerNote,
  NoteTargetType,
  UpdateNotePayload,
} from 'kesaseteli/handler/types/note';
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

const useUpdateNoteMutation = (
  noteId: string,
  targetType: NoteTargetType,
  targetId: string,
  options?: UseMutationOptions<HandlerNote, unknown, UpdateNotePayload>
): UseMutationResult<HandlerNote, unknown, UpdateNotePayload> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (payload: UpdateNotePayload) =>
      handleResponse<HandlerNote>(
        axios.put<HandlerNote>(
          `${BackendEndpoint.HANDLER_NOTES}${noteId}/`,
          payload
        )
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

export default useUpdateNoteMutation;
