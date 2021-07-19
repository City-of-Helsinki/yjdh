import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { Application } from '../types/application';

const useCreateApplicationQuery = (): UseMutationResult<
  Application,
  Error,
  Application
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<Application, Error, Application>(
    'createApplication',
    (application: Application) =>
      handleResponse<Application>(
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
