import { QueryKey, useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

export type DashboardStatsResponse = {
  youth_applications: {
    pending: number;
    processed: number;
    raw_counts: Record<string, number>;
  };
  employer_applications: {
    pending: number;
    processed: number;
    raw_counts: Record<string, number>;
  };
};

const useDashboardStatsQuery = (): UseQueryResult<DashboardStatsResponse> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const query = useQuery({
    queryKey: [BackendEndpoint.DASHBOARD_STATS] as QueryKey,
    queryFn: () =>
      handleResponse(
        axios.get<DashboardStatsResponse>(BackendEndpoint.DASHBOARD_STATS)
      ),
  });

  useQuerySideEffect(query, {
    onError: handleError,
  });

  return query;
};

export default useDashboardStatsQuery;
