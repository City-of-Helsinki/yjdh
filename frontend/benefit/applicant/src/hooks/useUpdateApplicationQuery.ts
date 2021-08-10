import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { ErrorResponse } from 'benefit/applicant/types/common';

const useUpdateApplicationQuery = (): UseMutationResult<
  ApplicationData,
  ErrorResponse,
  ApplicationData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<ApplicationData, ErrorResponse, ApplicationData>(
    ['application'],
    (application: ApplicationData) =>
      !application?.id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ApplicationData>(
            axios.put(
              `${BackendEndpoint.APPLICATIONS}${application?.id}/`,
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
