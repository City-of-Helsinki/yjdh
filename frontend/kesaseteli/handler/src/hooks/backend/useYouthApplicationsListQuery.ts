import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  PaginatedResponse,
  YouthApplication,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

export type YouthApplicationsQueryParams = {
  /** List of statuses to filter by */
  status?: string[];
  limit: number;
  offset: number;
  ordering?: string;
};

const useYouthApplicationsListQuery = (
  params: YouthApplicationsQueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<YouthApplication>>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<PaginatedResponse<YouthApplication>> => {
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
    queryKey: [BackendEndpoint.YOUTH_APPLICATIONS, params],
    queryFn: () =>
      handleResponse(
        axios.get<PaginatedResponse<YouthApplication>>(
          BackendEndpoint.YOUTH_APPLICATIONS,
          {
            params: searchParams,
          }
        )
      ),
    placeholderData: keepPreviousData,
    ...options,
  });

  useQuerySideEffect(query, {
    onError: handleError,
  });

  return query;
};

export default useYouthApplicationsListQuery;
