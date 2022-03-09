import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { TetEvent } from 'tet-shared/types/linkedevents';
import { createAxios, handleResponse } from 'tet/youth/backend-api/backend-api'; //TODO to shared

const useGetSingePosting = (id: string): UseQueryResult<TetEvent, Error> => {
  const axios = createAxios();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useQuery<TetEvent, Error>(
    ['posting', id],
    async ({ pageParam = null }) => {
      const res = !pageParam
        ? axios.get<TetEvent>(`event/${id}?include=location,keywords`, {
            params: {
              data_source: 'tet',
            },
          })
        : axios.get<TetEvent>(pageParam);
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    },
  );
};

export default useGetSingePosting;
