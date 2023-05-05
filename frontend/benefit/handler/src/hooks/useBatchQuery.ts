import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useBatchQuery = (
  status: BATCH_STATUSES
): UseQueryResult<BatchProposal[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  const params: {
    status: BATCH_STATUSES;
  } = {
    status,
  };

  return useQuery<BatchProposal[], Error>(
    ['applicationsList'],
    async () => {
      const res = axios.get<BatchProposal[]>(
        `${BackendEndpoint.APPLICATION_BATCHES}`,
        {
          params,
        }
      );
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useBatchQuery;
