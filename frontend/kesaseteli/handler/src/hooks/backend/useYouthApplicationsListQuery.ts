import {
  PaginatedResponse,
  YouthApplication,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { QueryKey, useQuery, UseQueryOptions } from 'react-query';
import { UseQueryResult } from 'react-query/types/react/types';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

export type YouthApplicationsQueryParams = {
  /** List of statuses to filter by */
  status?: string[];
  limit: number;
  offset: number;
  ordering?: string;
};

const useYouthApplicationsListQuery = (
  params: YouthApplicationsQueryParams,
  options?: UseQueryOptions<PaginatedResponse<YouthApplication>>
): UseQueryResult<PaginatedResponse<YouthApplication>> => {
  const { axios, handleResponse } = useBackendAPI();
  const handleError = useErrorHandler();

  const searchParams = new URLSearchParams();
  if (params.status) {
    params.status.forEach((s) => searchParams.append('status', s));
  }
  searchParams.append('limit', String(params.limit));
  searchParams.append('offset', String(params.offset));
  if (params.ordering) {
    searchParams.append('ordering', params.ordering);
  }

  return useQuery(
    [BackendEndpoint.YOUTH_APPLICATIONS, params] as QueryKey,
    () =>
      handleResponse(
        axios.get<PaginatedResponse<YouthApplication>>(
          BackendEndpoint.YOUTH_APPLICATIONS,
          {
            params: searchParams,
          }
        )
      ),
    {
      keepPreviousData: true,
      onError: handleError,
      ...options,
    }
  );
};

export default useYouthApplicationsListQuery;
