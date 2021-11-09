import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
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
  const locale = useLocale();
  return useMutation(
    'createApplication',
    () => {
      const language = (router.defaultLocale ?? DEFAULT_LANGUAGE) as Language;
      return handleResponse<Application>(
        axios.post(BackendEndpoint.APPLICATIONS, { language })
      );
    },
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
      onError: (error) => handleError(error, t, router, locale),
    }
  );
};

export default useCreateApplicationQuery;
