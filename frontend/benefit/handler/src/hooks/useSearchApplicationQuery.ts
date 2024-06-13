import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { SearchData } from '../types/search';

const useSearchApplicationQuery = (
  q: string,
  archived = false
): UseMutationResult<SearchData, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useMutation<SearchData, Error>(
    ['applicationsList'],
    async () => {
      const res = axios.get<SearchData>(`${BackendEndpoint.SEARCH}`, {
        params: { q, archived: archived ? '1' : '0', archival: 1 },
      });
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useSearchApplicationQuery;
