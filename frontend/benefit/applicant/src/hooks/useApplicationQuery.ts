import { useQuery, UseQueryResult } from 'react-query';

import { ApplicationData } from '../types/application';
import useBackendAPI from './useBackendAPI';

const useApplicationQuery = (
  status: string[]
): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `/v1/applications/?status=${status.join()}`
      );
      return handleResponse(res);
    }
  );
};

export default useApplicationQuery;
