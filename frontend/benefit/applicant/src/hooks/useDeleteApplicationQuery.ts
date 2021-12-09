import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useDeleteApplicationQuery = (): UseMutationResult<
  null,
  AxiosError<ErrorData>,
  string
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<null, AxiosError<ErrorData>, string>(
    'deleteApplication',
    (id: string) =>
      handleResponse<null>(
        axios.delete(`${BackendEndpoint.APPLICATIONS}${id}/`)
      ),
    {
      onSuccess: () => {
        queryClient.removeQueries('applications', { exact: true });
      },
    }
  );
};

export default useDeleteApplicationQuery;
