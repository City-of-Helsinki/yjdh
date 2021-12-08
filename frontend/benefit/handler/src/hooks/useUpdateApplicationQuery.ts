import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit/handler/backend-api/backend-api';
import useBackendAPI from 'benefit/handler/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/handler/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { ErrorData } from '../types/common';

const useUpdateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>(
    'updateApplication',
    (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.put(
          `${BackendEndpoint.APPLICATIONS}${application?.id ?? ''}/`,
          application
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
      },
    }
  );
};

export default useUpdateApplicationQuery;
