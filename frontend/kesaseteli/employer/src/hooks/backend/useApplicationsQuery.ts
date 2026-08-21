import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect, useRef } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type UseApplicationsQueryOptions<T, R = Application[]> = {
  onlyMine?: boolean;
  select?: (applications: R) => T;
  onError?: (error: Error | unknown) => void;
  year?: string;
  staleTime?: number;
  limit?: number;
  offset?: number;
};

const useApplicationsQuery = <T = Application[], R = Application[]>({
  onlyMine,
  select,
  onError,
  year,
  staleTime,
  limit,
  offset,
}: UseApplicationsQueryOptions<T, R> = {}): UseQueryResult<T> => {
  const { axios, handleResponse } = useBackendAPI();
  const defaultErrorHandler = useErrorHandler();
  const queryYear = year === 'all' ? undefined : year;

  const prevFiltersRef = useRef({ onlyMine, queryYear });
  let shouldKeepPreviousData = true;

  if (
    prevFiltersRef.current.onlyMine !== onlyMine ||
    prevFiltersRef.current.queryYear !== queryYear
  ) {
    shouldKeepPreviousData = false;
    prevFiltersRef.current = { onlyMine, queryYear };
  }

  const query = useQuery({
    queryKey: [
      BackendEndpoint.EMPLOYER_APPLICATIONS,
      { onlyMine, year: queryYear, limit, offset },
    ],
    queryFn: () =>
      handleResponse<R>(
        axios.get(BackendEndpoint.EMPLOYER_APPLICATIONS, {
          params: {
            only_mine: onlyMine,
            ...(queryYear ? { created_at__year: queryYear } : {}),
            ...(limit !== undefined ? { limit } : {}),
            ...(offset !== undefined ? { offset } : {}),
          },
        })
      ),
    select: select ? (applications) => select(applications) : undefined,
    staleTime: staleTime !== undefined ? staleTime : Infinity,
    retryDelay: 3000,
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
  });

  useEffect(() => {
    if (query.isError) {
      const errorHandler = onError ?? defaultErrorHandler;
      errorHandler(query.error);
    }
  }, [query, defaultErrorHandler, onError]);

  return query;
};

export default useApplicationsQuery;
