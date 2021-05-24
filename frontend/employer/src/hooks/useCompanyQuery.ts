import backendEndpoint from 'employer/backend-api/backend-endpoints';
import useBackendAPI from 'employer/hooks/useBackendAPI';
import Company from 'employer/types/company';
import { useQuery, UseQueryResult } from 'react-query';

const useCompanyQuery = (): UseQueryResult<Company, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<Company, Error>('company', async () => {
    const { data } = await axios.get<Company>(backendEndpoint.COMPANY);
    return data;
  });
};
export default useCompanyQuery;
