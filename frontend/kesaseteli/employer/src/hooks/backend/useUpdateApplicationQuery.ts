import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';

const useUpdateApplicationQuery = (
  id: Application['id'] | undefined,
  onSuccess = noop
): UseMutationResult<Application, unknown, DraftApplication> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const language = useLocale();
  return useMutation({
    mutationKey: [`${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/`],
    mutationFn: (application: DraftApplication) =>
      id
        ? handleResponse<Application>(
            axios.put(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/`, {
              ...application,
              language,
            })
          )
        : Promise.reject(new Error('Missing id')),
    onSuccess: (application) => {
      onSuccess(application);
      void queryClient.invalidateQueries({
        queryKey: [`${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/`],
      });
      void queryClient.invalidateQueries({
        queryKey: [BackendEndpoint.EMPLOYER_APPLICATIONS],
      });
    },
  });
};

export default useUpdateApplicationQuery;
