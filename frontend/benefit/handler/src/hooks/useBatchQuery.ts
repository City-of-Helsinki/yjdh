import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BatchProposal } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useBatchQuery = (): UseQueryResult<BatchProposal[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  return useQuery<BatchProposal[], Error>(
    ['applicationsList'],
    async () => {
      const res = axios.get<BatchProposal[]>(
        BackendEndpoint.APPLICATION_BATCHES
      );
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useBatchQuery;
