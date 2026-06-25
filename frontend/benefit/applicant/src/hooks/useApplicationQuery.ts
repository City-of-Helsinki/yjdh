import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationQuery = (
  id: string
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData, Error>({
    queryKey: ['applications', id],
    queryFn: () =>
      id
        ? handleResponse<ApplicationData>(
            axios.get(`${BackendEndpoint.APPLICATIONS}${id}/`)
          )
        : Promise.reject(new Error('Missing application id')),
    enabled: Boolean(id),
    staleTime: Infinity,
  });
};

export default useApplicationQuery;
