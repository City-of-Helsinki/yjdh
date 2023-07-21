import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useReviewStateQuery = (
  id: string
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData, Error>(
    ['reviewState', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ApplicationData>(
            axios.get(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/review/`)
          ),
    {
      enabled: Boolean(id),
      staleTime: Infinity,
    }
  );
};

export default useReviewStateQuery;
