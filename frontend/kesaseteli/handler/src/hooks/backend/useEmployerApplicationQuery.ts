import axios from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useEmployerApplicationQuery = <T = any>(
  id?: string,
  options?: UseQueryOptions<T>
): UseQueryResult<T> => {
  const handleError = useErrorHandler();
  return useQuery({
    queryKey: id ? `${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/` : undefined,
    enabled: Boolean(id),
    staleTime: Infinity,
    onError: (error: unknown) => {
      const is404Error =
        axios.isAxiosError(error) && error.response?.status === 404;
      if (!is404Error) {
        handleError(error);
      }
    },
    ...options,
  });
};

export default useEmployerApplicationQuery;
