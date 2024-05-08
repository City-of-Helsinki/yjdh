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

  const state = ['received'];

  const handleError = (): void => {
    showErrorToast(
      t('common:applications.list.errors.fetch.label'),
      t('common:applications.list.errors.fetch.text', {
        state,
      })
    );
  };

  const params: {
    order_by: string;
    state: string;
  } = {
    order_by: orderBy,
    state: state.join(','),
  };

  return useQuery<ApplicationAlterationData[], Error>(
    ['applicationAlterationList', ...state],
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
