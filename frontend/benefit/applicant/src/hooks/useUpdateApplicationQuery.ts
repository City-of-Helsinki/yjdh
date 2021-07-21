import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useUpdateApplicationQuery = (
  draftApplication?: ApplicationData
): UseMutationResult<ApplicationData, Error, ApplicationData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const id = draftApplication?.id;
  return useMutation<ApplicationData, Error, ApplicationData>(
    ['application', id],
    (application: ApplicationData) =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ApplicationData>(
            axios.put(`${BackendEndpoint.APPLICATIONS}${id}/`, application)
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
