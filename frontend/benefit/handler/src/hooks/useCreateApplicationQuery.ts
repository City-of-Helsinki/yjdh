import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useCreateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>({
    mutationKey: ['createApplication'],
    mutationFn: (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.post(BackendEndpoint.HANDLER_APPLICATIONS, application)
      ),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['applications'], exact: true });
    },
  });
};

export default useCreateApplicationQuery;
