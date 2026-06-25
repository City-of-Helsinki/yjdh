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
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['deleteApplication'],
    mutationFn: (id: string) =>
      handleResponse<null>(
        axios.delete(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/`)
      ),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['applications'], exact: true });
      return queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
    },
  });
};

export default useDeleteApplicationQuery;
