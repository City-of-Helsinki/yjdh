import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { BackendEndpoint, createAxios, handleResponse } from 'tet/youth/backend-api/backend-api'; // TODO to shared
import { QueryParams } from 'tet/youth/types/queryparams';
import { LinkedEventsPagedResponse, TetEvent } from 'tet-shared/types/linkedevents';

const useGetPostings = (params: QueryParams): UseQueryResult<LinkedEventsPagedResponse<TetEvent>, Error> => {
  const axios = createAxios();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useQuery<LinkedEventsPagedResponse<TetEvent>, Error>(
    ['postings', params],
    async () => {
      const res = axios.get<LinkedEventsPagedResponse<TetEvent>>(`${BackendEndpoint.EVENT}`, {
        params: {
          data_source: 'tet',
          show_all: true,
          start: 'today',
          page_size: 100,
          ...params,
        },
      });
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    },
  );
};

export default useGetPostings;
