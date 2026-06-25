import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useAuth from 'shared/hooks/useAuth';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationMessagesQuery = (): UseQueryResult<
  ApplicationData[],
  Error
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const params = {};

  const query = useQuery<ApplicationData[], Error>({
    queryKey: ['messageNotifications'],
    queryFn: async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_WITH_UNREAD_MESSAGES}`,
        {
          params,
        }
      );
      return handleResponse(res);
    },
    enabled: isAuthenticated,
    refetchInterval: 1225 * 1000,
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

export default useApplicationMessagesQuery;
