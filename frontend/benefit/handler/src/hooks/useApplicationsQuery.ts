import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = (
  status: string[],
  orderBy = 'id'
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', {
        status,
      })
    );
  };

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_SIMPLIFIED}`,
        {
          params: {
            status: status.join(','),
            order_by: orderBy,
          },
        }
      );
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useApplicationsQuery;
