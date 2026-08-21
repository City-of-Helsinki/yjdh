import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ReviewStateData } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useReviewStateQuery = (
  id: string
): UseQueryResult<ReviewStateData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ReviewStateData, Error>({
    queryKey: ['reviewState', id],
    queryFn: () =>
      id
        ? handleResponse<ReviewStateData>(
            axios.get(`${BackendEndpoint.HANDLER_APPLICATIONS}${id}/review/`)
          )
        : Promise.reject(new Error('Missing application id')),
    enabled: Boolean(id),
    staleTime: Infinity,
  });
};

export default useReviewStateQuery;
