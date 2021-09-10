import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { ApplicationData } from 'benefit/applicant/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationTemplateQuery = (
  id: string
): UseQueryResult<ApplicationData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData, Error>(
    ['applicationTemplate', id],
    async () => {
      const res = axios.get<ApplicationData>(
        `${BackendEndpoint.APPLICATIONS}get_application_template/`
      );
      return handleResponse(res);
    },
    { enabled: !id, retry: false }
  );
};

export default useApplicationTemplateQuery;
