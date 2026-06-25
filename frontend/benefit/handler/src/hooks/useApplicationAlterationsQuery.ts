import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const state = ['received'];

const useApplicationAlterationsQuery = (
  orderBy = 'id'
): UseQueryResult<ApplicationAlterationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const params: {
    order_by: string;
    state: string;
  } = {
    order_by: orderBy,
    state: state.join(','),
  };

  const query = useQuery<ApplicationAlterationData[], Error>({
    queryKey: ['applicationAlterationList', ...state],
    queryFn: async () => {
      const res = axios.get<ApplicationAlterationData[]>(
        `${BackendEndpoint.HANDLER_APPLICATION_ALTERATION}`,
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
          state,
        })
      );
    }
  }, [query, t]);

  return query;
};

export default useApplicationAlterationsQuery;
