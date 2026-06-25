import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Company from 'shared/types/company';

const useCompanyQuery = (): UseQueryResult<Company> => {
  // Company name is supplemental — don't redirect to /500 or /login if it fails.
  // The dashboard renders fine without it; organisationName will be undefined.
  const errorHandler = useErrorHandler({
    onServerError: () => {},
    onAuthError: () => {},
  });

  const query = useQuery<Company, Error>({
    queryKey: [BackendEndpoint.COMPANY],
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [query, errorHandler]);

  return query;
};

export default useCompanyQuery;
