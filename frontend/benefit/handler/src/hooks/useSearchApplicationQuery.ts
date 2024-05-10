import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useSearchApplicationQuery = (
  q: string
): UseMutationResult<unknown, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<unknown, Error>(
    ['applicationsList'],
    async () => {
      const res = axios.get<unknown>(`${BackendEndpoint.SEARCH}?q=${q}`, {});
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useSearchApplicationQuery;
