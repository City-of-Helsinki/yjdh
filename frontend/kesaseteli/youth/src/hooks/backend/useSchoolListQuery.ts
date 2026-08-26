import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

const useSchoolListQuery = (): UseQueryResult<string[]> => {
  const errorHandler = useErrorHandler();
  const query = useQuery<string[]>({
    queryKey: [BackendEndpoint.SCHOOLS],
    staleTime: Infinity,
  });

  useQuerySideEffect(query, {
    onError: errorHandler,
  });

  return query;
};

export default useSchoolListQuery;
