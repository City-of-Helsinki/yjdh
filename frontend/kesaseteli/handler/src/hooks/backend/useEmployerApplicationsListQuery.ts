import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  BaseApplication,
  PaginatedResponse,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
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
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
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

  const query = useQuery({
    queryKey: [BackendEndpoint.EMPLOYER_APPLICATIONS, params],
    queryFn: () =>
      handleResponse(
        axios.get<PaginatedResponse<T>>(BackendEndpoint.EMPLOYER_APPLICATIONS, {
          params: searchParams,
        })
      ),
    placeholderData: keepPreviousData,
    ...options,
  });

  useEffect(() => {
    if (query.isError) {
      handleError(query.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export default useEmployerApplicationsListQuery;
