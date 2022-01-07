import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useSchoolListQuery = (): UseQueryResult<string[]> =>
  useQuery(BackendEndpoint.SCHOOLS, {
    staleTime: Infinity,
    onError: useErrorHandler(false),
  });

export default useSchoolListQuery;
