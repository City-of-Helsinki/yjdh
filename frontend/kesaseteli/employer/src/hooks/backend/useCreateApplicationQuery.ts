import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useCreateApplicationQuery = (): UseMutationResult<
  Application,
  Error,
  void
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();
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
            `${BackendEndpoint.APPLICATIONS}${newApplication?.id}/`,
            newApplication
          );
          void queryClient.invalidateQueries(BackendEndpoint.APPLICATIONS, {
            exact: true,
          });
        } else {
          throw new Error('Missing id');
        }
      },
      onError: (error) => handleError(error, t, router, language),
    }
  );
};

export default useCreateApplicationQuery;
