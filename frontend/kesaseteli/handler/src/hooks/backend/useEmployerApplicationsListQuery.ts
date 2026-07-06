import {
  BaseApplication,
  PaginatedResponse,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

export type EmployerApplicationsQueryParams = {
  /** List of statuses to filter by */
  status?: string[];
  limit: number;
  offset: number;
  /** Valid ordering fields: created_at, company__name, company__business_id, status, modified_at, submitted_at */
  ordering?: string;
};

const useEmployerApplicationsListQuery = <
  T extends BaseApplication = BaseApplication
>(
  params: EmployerApplicationsQueryParams,
  options?: UseQueryOptions<PaginatedResponse<T>>
): UseQueryResult<PaginatedResponse<T>> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const searchParams = new URLSearchParams();
  if (params.status && params.status.length > 0) {
    params.status.forEach((s) => searchParams.append('status', s));
  }
  searchParams.append('limit', String(params.limit));
  searchParams.append('offset', String(params.offset));
  if (params.ordering) {
    searchParams.append('ordering', params.ordering);
  }

  return useQuery(
    [BackendEndpoint.EMPLOYER_APPLICATIONS, params] as QueryKey,
    () =>
      handleResponse(
        axios.get<PaginatedResponse<T>>(BackendEndpoint.EMPLOYER_APPLICATIONS, {
          params: searchParams,
        })
      ),
    {
      keepPreviousData: true,
      onError: handleError,
      ...options,
    }
  );
};

export default useEmployerApplicationsListQuery;
