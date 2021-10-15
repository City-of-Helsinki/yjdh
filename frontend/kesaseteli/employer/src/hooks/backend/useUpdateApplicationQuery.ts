import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import noop from 'lodash/noop';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';

const useUpdateApplicationQuery = (
  draftApplication?: DraftApplication,
  onSuccess = noop
): UseMutationResult<Application, Error, DraftApplication> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const language = useLocale();
  const id = draftApplication?.id;

  return useMutation(
    `${BackendEndpoint.APPLICATIONS}${String(id)}/`,
    (application: DraftApplication) =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
            axios.put(`${BackendEndpoint.APPLICATIONS}${id}/`, {
              ...application,
              language,
            })
          ),
    {
      onSuccess: (application) => {
        onSuccess(application);
        void queryClient.invalidateQueries(
          `${BackendEndpoint.APPLICATIONS}${String(id)}/`
        );
      },
    }
  );
};

export default useUpdateApplicationQuery;
