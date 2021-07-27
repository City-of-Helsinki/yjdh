import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useQuery, UseQueryResult } from 'react-query';

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
    { enabled: Boolean(id) }
  );
};

export default useApplicationQuery;
