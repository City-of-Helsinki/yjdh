import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useCreateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  Error,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, Error, ApplicationData>(
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
