import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useUpdateApplicationQuery = (
  draftApplication?: Application
): UseMutationResult<Application, Error, Application> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const id = draftApplication?.id;
  return useMutation<Application, Error, Application>(
    ['application', id],
    (application: Application) =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
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
