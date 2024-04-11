import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useDeleteApplicationQuery = (): UseMutationResult<
  null,
  AxiosError<ErrorData>,
  { id: string; applicationId: string }
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation(
    'deleteApplicationAlteration',
    ({ id }) =>
      handleResponse<null>(
        axios.delete(`${BackendEndpoint.APPLICATION_ALTERATION}${id}/`)
      ),
    {
      onSuccess: (data, { applicationId }) => {
        void queryClient.resetQueries(['applications', applicationId]);
      },
    }
  );
};

export default useDeleteApplicationQuery;
