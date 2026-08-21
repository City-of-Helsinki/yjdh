import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import {
  HandlerNote,
  NoteTargetType,
  UpdateNotePayload,
} from 'kesaseteli/handler/types/note';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateNoteQueries from './invalidateNoteQueries';

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
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidateNoteQueries(queryClient, targetType, targetId);
      if (onSuccess) {
        void onSuccess(data, variables, onMutateResult, context);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useUpdateNoteMutation;
