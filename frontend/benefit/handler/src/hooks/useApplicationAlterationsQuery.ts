import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationAlterationsQuery = (
  orderBy = 'id'
): UseQueryResult<ApplicationAlterationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const status = ['received'];

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', {
        status,
      })
    );
  };

  const params: {
    order_by: string;
    status: Array<string>;
  } = {
    order_by: orderBy,
    status,
  };

  return useQuery<ApplicationAlterationData[], Error>(
    ['applicationAlterationList', ...status],
    async () => {
      const res = axios.get<ApplicationAlterationData[]>(
        `${BackendEndpoint.HANDLER_APPLICATION_ALTERATION}`,
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

export default useApplicationAlterationsQuery;
