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
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateNoteQueries from './invalidateNoteQueries';

const useCreateNoteMutation = (
  targetType: NoteTargetType,
  targetId: string,
  parentApplicationId?: string,
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
    onSuccess: async (...onSuccessArgs) => {
      await invalidateNoteQueries(queryClient, targetType, targetId, parentApplicationId);
      if (onSuccess) {
        await onSuccess(...onSuccessArgs);
      }
    },
    onError: useErrorHandler(),
    ...restOptions,
  });
};

export default useCreateNoteMutation;
