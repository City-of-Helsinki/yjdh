import { BackendEndpoint } from 'benefit/handler/backend-api/backend-api';
import useBackendAPI from 'benefit/handler/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/handler/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationsQuery = (
  status: string[]
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS}?status=${status.join()}`
      );
      return handleResponse(res);
    }
  );
};

export default useApplicationsQuery;
