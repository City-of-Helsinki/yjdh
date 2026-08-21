import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { NoteTargetType } from 'kesaseteli/handler/types/note';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateNoteQueries from './invalidateNoteQueries';

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

export default useDeleteNoteMutation;
