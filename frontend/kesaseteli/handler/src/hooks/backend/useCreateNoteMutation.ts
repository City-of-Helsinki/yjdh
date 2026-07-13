import {
  CreateNotePayload,
  HandlerNote,
  NoteTargetType,
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

const useCreateNoteMutation = (
  targetType: NoteTargetType,
  targetId: string,
  options?: UseMutationOptions<HandlerNote, unknown, CreateNotePayload>
): UseMutationResult<HandlerNote, unknown, CreateNotePayload> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      handleResponse<HandlerNote>(
        axios.post<HandlerNote>(BackendEndpoint.HANDLER_NOTES, payload)
      ),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries(
        getHandlerNotesQueryKey(targetType, targetId)
      );
      await queryClient.invalidateQueries(
        getYouthApplicationTimelineKey(targetId)
      );
      await queryClient.invalidateQueries(
        getEmployerApplicationTimelineKey(targetId)
      );
      if (onSuccess) {
        await onSuccess(data, variables, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCreateNoteMutation;
