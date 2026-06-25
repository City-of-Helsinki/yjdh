import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
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
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: [getHandlerNotesQueryKey(targetType, targetId)],
      });
      await queryClient.invalidateQueries({
        queryKey: [getYouthApplicationTimelineKey(targetId)],
      });
      await queryClient.invalidateQueries({
        queryKey: [getEmployerApplicationTimelineKey(targetId)],
      });
      if (onSuccess) {
        await onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCreateNoteMutation;
