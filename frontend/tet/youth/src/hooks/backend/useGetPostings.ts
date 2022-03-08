import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useInfiniteQuery, UseInfiniteQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { LinkedEventsPagedResponse, TetEvent } from 'tet/youth/linkedevents';
import { QueryParams } from 'tet/youth/types/queryparams';
import { createAxios, handleResponse } from 'tet/youth/backend-api/backend-api'; //TODO to shared

const useGetPostings = (params: QueryParams): UseInfiniteQueryResult<LinkedEventsPagedResponse<TetEvent>, Error> => {
  const axios = createAxios();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useInfiniteQuery<LinkedEventsPagedResponse<TetEvent>, Error>(
    ['postings', params],
    async ({ pageParam = null }) => {
      const res = !pageParam
        ? axios.get<LinkedEventsPagedResponse<TetEvent>>(`${BackendEndpoint.EVENT}`, {
            params: {
              data_source: 'tet',
              ...params,
            },
          })
        : axios.get<LinkedEventsPagedResponse<TetEvent>>(pageParam);
      return handleResponse(res);
    },
    {
      getNextPageParam: (lastPage, pages) => {
        return lastPage.meta.next;
      },
      onError: () => handleError(),
    },
  );
};

export default useGetPostings;
