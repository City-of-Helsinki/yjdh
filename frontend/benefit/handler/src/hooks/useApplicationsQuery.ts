import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = (
  status: string[],
  orderBy = 'id',
  excludeBatched = false,
  filterArchived = false,
  filterAhjoCaseId = false
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const params: {
    status: string;
    order_by: string;
    exclude_batched?: '1';
    filter_archived?: '1';
    ahjo_case?: '0' | '1';
  } = {
    status: status.join(','),
    order_by: orderBy,
    ahjo_case: filterAhjoCaseId ? '1' : '0',
  };

  if (excludeBatched) {
    params.exclude_batched = '1';
  }

  if (filterArchived) {
    params.filter_archived = '1';
  }

  const query = useQuery<ApplicationData[], Error>({
    queryKey: ['applicationsList', ...status],
    queryFn: async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.HANDLER_APPLICATIONS_SIMPLIFIED}`,
        {
          params,
        }
      );
      return handleResponse(res);
    },
  });

  useEffect(() => {
    if (query.isError) {
      showErrorToast(
        t('common:applications.list.errors.fetch.label'),
        t('common:applications.list.errors.fetch.text', {
          status,
        })
      );
    }
  }, [query, status, t]);

  return query;
};

export default useApplicationsQuery;
