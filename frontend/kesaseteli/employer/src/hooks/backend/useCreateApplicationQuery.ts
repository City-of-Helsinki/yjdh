import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import Application from 'shared/types/employer-application';

const useCreateApplicationQuery = (): UseMutationResult<
  Application,
  Error,
  void
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<Application, Error, void>(
    'createApplication',
    () =>
      handleResponse<Application>(axios.post(BackendEndpoint.APPLICATIONS, {})),
    {
      onSuccess: (newApplication) => {
        if (newApplication?.id) {
          queryClient.setQueryData(
            ['applications', newApplication.id],
            newApplication
          );
          void queryClient.invalidateQueries('applications', { exact: true });
        } else {
          throw new Error('Missing id');
        }
      },
    }
  );
};

export default useCreateApplicationQuery;
