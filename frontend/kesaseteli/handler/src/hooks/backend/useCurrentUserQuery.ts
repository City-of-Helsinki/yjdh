import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import User from 'shared/types/user';

const useCurrentUserQuery = ({
  enabled = true,
}: {
  enabled?: boolean;
} = {}): UseQueryResult<User> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<User>({
    queryKey: [BackendEndpoint.CURRENT_USER],
    queryFn: () =>
      handleResponse<User>(axios.get<User>(BackendEndpoint.CURRENT_USER)),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export default useCurrentUserQuery;
