import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
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

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', { status: 'error' })
    );
  };

  const params = {};

  return useQuery<ApplicationData[], Error>(
    ['messageNotifications'],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_WITH_UNREAD_MESSAGES}`,
        {
          params,
        }
      );
      return handleResponse(res);
    },
    {
      enabled: isAuthenticated,
      refetchInterval: 1225 * 1000,
      onError: () => handleError(),
    }
  );
};

export default useApplicationMessagesQuery;
