import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = (
  status: string[],
  orderBy = 'id',
  archived = false
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status, archived],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_SIMPLIFIED}`,
        {
          params: {
            status: status.join(','),
            order_by: orderBy,
            filter_archived: archived ? '1' : '0',
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
