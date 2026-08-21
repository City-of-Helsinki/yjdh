import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useDeleteApplicationQuery = (): UseMutationResult<
  null,
  AxiosError<ErrorData>,
  { id: string; applicationId: string }
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteApplicationAlteration'],
    mutationFn: ({ id }) =>
      handleResponse<null>(
        axios.delete(`${BackendEndpoint.HANDLER_APPLICATION_ALTERATION}${id}/`)
      ),
    onSuccess: (data, { applicationId }) => {
      void queryClient.resetQueries({
        queryKey: ['applications', applicationId],
      });
    },
  });
};

export default useDeleteApplicationQuery;
