import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

import { NewApplicationData } from '../types/application';

const useCreateApplicationQuery = (): UseMutationResult<
  NewApplicationData,
  Error,
  NewApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<NewApplicationData, Error, NewApplicationData>(
    'createApplication',
    (application: NewApplicationData) =>
      handleResponse<NewApplicationData>(
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
