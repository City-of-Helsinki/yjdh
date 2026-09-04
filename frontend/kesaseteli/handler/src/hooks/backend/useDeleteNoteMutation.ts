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
  parentApplicationId?: string,
  options?: UseMutationOptions<unknown, unknown, string>
): UseMutationResult<unknown, unknown, string> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationFn: (id: string) =>
      handleResponse<unknown>(
        axios.delete(`${BackendEndpoint.HANDLER_NOTES}${id}/`)
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

export default useDeleteNoteMutation;
