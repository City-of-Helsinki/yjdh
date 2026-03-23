import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'kesaseteli-shared/hooks/useErrorHandler';
import { useQuery, UseQueryResult } from 'react-query';

const useSchoolListQuery = (): UseQueryResult<string[]> =>
  useQuery(BackendEndpoint.SCHOOLS, {
    staleTime: Infinity,
    onError: useErrorHandler(),
  });

export default useSchoolListQuery;
