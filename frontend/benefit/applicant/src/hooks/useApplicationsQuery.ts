import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = (
  status: string[],
  orderKey = 'id',
  orderBy = 'asc'
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_SIMPLIFIED}`,
        {
          params: {
            status: status.join(','),
            order_by: orderBy,
            order_key: orderKey,
          },
        }
      );
      return handleResponse(res);
    },
    {
      retry: false,
    }
  );
};

export default useApplicationsQuery;
