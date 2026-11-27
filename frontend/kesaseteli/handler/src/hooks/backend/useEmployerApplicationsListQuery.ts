import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import {
  BaseApplication,
  PaginatedResponse,
} from 'kesaseteli/handler/types/application';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';

import useApplicationsListQuery, {
  ApplicationsQueryParams,
} from './useApplicationsListQuery';

export type EmployerApplicationsQueryParams = ApplicationsQueryParams;

const useEmployerApplicationsListQuery = <
  T extends BaseApplication = BaseApplication
>(
  params: EmployerApplicationsQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
): UseQueryResult<PaginatedResponse<T>> =>
  useApplicationsListQuery<T>(
    BackendEndpoint.EMPLOYER_APPLICATIONS,
    params,
    options
  );

export default useEmployerApplicationsListQuery;
