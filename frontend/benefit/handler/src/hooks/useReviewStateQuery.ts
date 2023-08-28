import { ReviewStateData } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useReviewStateQuery = (
  id: string
): UseQueryResult<ReviewStateData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ReviewStateData, Error>(
    ['reviewState', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ReviewStateData>(
            axios.get(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/review/`)
          ),
    {
      enabled: Boolean(id),
      staleTime: Infinity,
    }
  );
};

export default useReviewStateQuery;
