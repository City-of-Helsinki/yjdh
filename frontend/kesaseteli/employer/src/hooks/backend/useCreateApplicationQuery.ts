import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useCreateApplicationQuery = (): UseMutationResult<
  Application,
  Error,
  void
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const language = useLocale();
  return useMutation(
    'createApplication',
    () =>
      handleResponse<Application>(
        axios.post(BackendEndpoint.APPLICATIONS, { language })
      ),
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
