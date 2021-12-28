import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationQuery = (
  id: string
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData, Error>(
    ['applications', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<ApplicationData>(
            axios.get(`${BackendEndpoint.APPLICATIONS}${id}/`)
          ),
    {
      enabled: Boolean(id),
      staleTime: Infinity,
    }
  );
};

export default useApplicationQuery;
