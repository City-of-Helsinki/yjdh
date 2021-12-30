import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
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
  return useMutation(
    `${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/`,
    (application: DraftApplication) =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
            axios.put(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/`, {
              ...application,
              language,
            })
          ),
    {
      onSuccess: (application) => {
        onSuccess(application);
        void queryClient.invalidateQueries(
          `${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/`
        );
      },
    }
  );
};

export default useUpdateApplicationQuery;
