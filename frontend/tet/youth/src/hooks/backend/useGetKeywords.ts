import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { LinkedEventsPagedResponse, LocalizedObject, TetEvent } from 'tet/youth/linkedevents';
import { QueryParams } from 'tet/youth/types/queryparams';
import { createAxios } from 'tet/youth/query-client/create-query-client';
import { IdObject } from 'tet/youth/linkedevents';

type Keyword = IdObject & {
  name: {
    fi: string;
  };
};

const useGetKeywords = (): UseQueryResult<LinkedEventsPagedResponse<Keyword>, Error> => {
  const { handleResponse } = useBackendAPI();
  const axios = createAxios();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useQuery<LinkedEventsPagedResponse<Keyword>, Error>(
    ['postings'],
    async () => {
      const res = axios.get<LinkedEventsPagedResponse<Keyword>>(`${BackendEndpoint.KEYWORD}`, {
        params: {
          show_all_keywords: 'true',
          page_size: 3,
          data_source: 'helmet',
        },
      });
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    },
  );
};

export default useGetKeywords;
