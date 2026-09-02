import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import JobType from 'kesaseteli-shared/types/job-type';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

const useJobTypesQuery = (): UseQueryResult<JobType[]> => {
  const { axios, handleResponse } = useBackendAPI();
  const locale = useLocale();
  const errorHandler = useErrorHandler();

  const query = useQuery({
    queryKey: [BackendEndpoint.JOB_TYPES, locale],
    queryFn: () =>
      handleResponse(
        axios.get(BackendEndpoint.JOB_TYPES, {
          headers: { 'Accept-Language': locale },
        })
      ),
    staleTime: Infinity,
  });

  useQuerySideEffect(query, {
    onError: errorHandler,
  });

  return query;
};

export default useJobTypesQuery;
