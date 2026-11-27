import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import {
  PaginatedResponse,
  YouthApplication,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';

import useApplicationsListQuery, {
  ApplicationsQueryParams,
} from './useApplicationsListQuery';

export type YouthApplicationsQueryParams = ApplicationsQueryParams;

const useYouthApplicationsListQuery = (
  params: YouthApplicationsQueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<YouthApplication>>,
    'queryKey' | 'queryFn'
  >
): UseQueryResult<PaginatedResponse<YouthApplication>> =>
  useApplicationsListQuery<YouthApplication>(
    BackendEndpoint.YOUTH_APPLICATIONS,
    params,
    options
  );

export default useYouthApplicationsListQuery;
