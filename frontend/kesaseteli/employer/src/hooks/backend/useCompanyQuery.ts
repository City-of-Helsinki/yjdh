import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Company from 'shared/types/company';

const useCompanyQuery = (): UseQueryResult<Company> =>
  useQuery(BackendEndpoint.COMPANY, {
    staleTime: Infinity,
    // Company name is supplemental — don't redirect to /500 or /login if it fails.
    // The dashboard renders fine without it; organisationName will be undefined.
    onError: useErrorHandler({
      onServerError: () => {},
      onAuthError: () => {},
    }),
  });

export default useCompanyQuery;
