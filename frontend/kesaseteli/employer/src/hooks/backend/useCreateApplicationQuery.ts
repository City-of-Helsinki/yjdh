import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import Application from 'shared/types/application';

const useCreateApplicationQuery = (): UseMutationResult<
  Application,
  unknown,
  void
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    'createApplication',
    () => {
      const language = (router.defaultLocale ?? DEFAULT_LANGUAGE) as Language;
      return handleResponse<Application>(
        axios.post(BackendEndpoint.EMPLOYER_APPLICATIONS, { language })
      );
    },
    {
      onSuccess: (newApplication) => {
        if (newApplication?.id) {
          queryClient.setQueryData(
            `${BackendEndpoint.EMPLOYER_APPLICATIONS}${newApplication?.id}/`,
            newApplication
          );
          void queryClient.invalidateQueries(
            BackendEndpoint.EMPLOYER_APPLICATIONS,
            {
              exact: true,
            }
          );
        } else {
          throw new Error('Missing id');
        }
      },
    }
  );
};

export default useCreateApplicationQuery;
