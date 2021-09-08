import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import Application from 'shared/types/employer-application';

const useUpdateApplicationQuery = (
  draftApplication?: Application
): UseMutationResult<Application, Error, Application> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const id = draftApplication?.id;

  return useMutation<Application, Error, Application>(
    ['applications', id],
    (application: Application) =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
            axios.put(`${BackendEndpoint.APPLICATIONS}${id}/`, application)
          ),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['applications', id], data);
      },
    }
  );
};

export default useUpdateApplicationQuery;
