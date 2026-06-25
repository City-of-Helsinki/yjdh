import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useBatchQuery = (
  status: BATCH_STATUSES[],
  orderBy?: string
): UseQueryResult<BatchProposal[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const params = {
    status: status.join(','),
    order_by: orderBy || '-created_at',
  };

  const query = useQuery<BatchProposal[], Error>({
    queryKey: ['applicationsList'],
    queryFn: async () => {
      const res = axios.get<BatchProposal[]>(
        `${BackendEndpoint.APPLICATION_BATCHES}`,
        {
          params,
        }
      );
      return handleResponse(res);
    },
    refetchInterval: 60 * 1000,
  });

  useEffect(() => {
    if (query.isError) {
      showErrorToast(
        t('common:applications.list.errors.fetch.label'),
        t('common:applications.list.errors.fetch.text', { status: 'error' })
      );
    }
  }, [query, t]);

  return query;
};

export default useBatchQuery;
