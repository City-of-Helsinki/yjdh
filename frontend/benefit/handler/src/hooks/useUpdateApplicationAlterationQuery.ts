import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useUpdateApplicationAlterationQuery = (): UseMutationResult<
  null,
  AxiosError<ErrorData>,
  {
    id: string;
    applicationId: string;
    data: Partial<ApplicationAlterationData>;
  }
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation(
    'updateApplicationAlteration',
    ({ id, data }) =>
      handleResponse<null>(
        axios.patch(`${BackendEndpoint.HANDLER_APPLICATION_ALTERATION}${id}/`, {
          ...data,
        })
      ),
    {
      onSuccess: (_data, { applicationId }) => {
        void queryClient.resetQueries(['applications', applicationId]);
      },
    }
  );
};

export default useUpdateApplicationAlterationQuery;
