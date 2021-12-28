import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useCreateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  AxiosError<ErrorData>,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, AxiosError<ErrorData>, ApplicationData>(
    'createApplication',
    (application: ApplicationData) =>
      handleResponse<ApplicationData>(
        axios.post(BackendEndpoint.APPLICATIONS, application)
      ),
    {
      onSuccess: () => {
        queryClient.removeQueries('applications', { exact: true });
      },
    }
  );
};

export default useCreateApplicationQuery;
