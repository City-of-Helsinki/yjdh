import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';

const useUpdateApplicationQuery = (
  id: Application['id'] | undefined,
  onSuccess = noop
): UseMutationResult<Application, Error, DraftApplication> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const language = useLocale();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
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
      onError: (error) => handleError(error, t, router, locale),
    }
  );
};

export default useUpdateApplicationQuery;
