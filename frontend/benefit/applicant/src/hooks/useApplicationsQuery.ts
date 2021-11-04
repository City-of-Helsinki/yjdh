import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
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
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
};

export default useApplicationsQuery;
