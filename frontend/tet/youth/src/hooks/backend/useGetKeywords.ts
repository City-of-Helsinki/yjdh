import { BackendEndpoint } from 'tet/youth/backend-api/backend-api';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { LinkedEventsPagedResponse } from 'tet/youth/linkedevents';
import { createAxios, handleResponse } from 'tet/youth/backend-api/backend-api'; //TODO to shared
import { IdObject } from 'tet/youth/linkedevents';

type Keyword = IdObject & {
  name: {
    fi: string;
  };
};

const useGetKeywords = (): UseQueryResult<LinkedEventsPagedResponse<Keyword>, Error> => {
  const axios = createAxios();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(t('common:applications.list.errors.fetch.label'), t('common:applications.list.errors.fetch.text'));
  };

  return useQuery<LinkedEventsPagedResponse<Keyword>, Error>(
    ['keywords'],
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
