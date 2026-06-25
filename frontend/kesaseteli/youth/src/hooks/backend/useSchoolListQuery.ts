import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useSchoolListQuery = (): UseQueryResult<string[]> => {
  const errorHandler = useErrorHandler();
  const query = useQuery<string[]>({
    queryKey: [BackendEndpoint.SCHOOLS],
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [query, errorHandler]);

  return query;
};

export default useSchoolListQuery;
