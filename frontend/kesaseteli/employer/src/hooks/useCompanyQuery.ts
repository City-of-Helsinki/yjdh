import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Company from 'kesaseteli/employer/types/company';
import { useQuery, UseQueryResult } from 'react-query';

const useCompanyQuery = (): UseQueryResult<Company, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<Company, Error>('company', () =>
    handleResponse(axios.get<Company>(BackendEndpoint.COMPANY))
  );
};
export default useCompanyQuery;
