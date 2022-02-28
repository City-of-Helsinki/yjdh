import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';
import { QueryParams } from 'tet/youth/types/queryparams';

const useGetPostings = (params: QueryParams): UseQueryResult<LinkedEventsPagedResponse<TetEvent>, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useQuery<LinkedEventsPagedResponse<TetEvent>, Error>(
    ['postings', params],
    async () => {
      const res = axios.get<LinkedEventsPagedResponse<TetEvent>>(`${BackendEndpoint.EVENT}}`);
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    },
  );
};

export default useGetPostings;
