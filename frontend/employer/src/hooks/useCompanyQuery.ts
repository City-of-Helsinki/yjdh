import { AxiosError } from 'axios';
import useAxios from 'employer/hooks/useAxios';
import Company from 'employer/types/company';
import { useQuery, UseQueryResult } from 'react-query';

const useCompanyQuery = (): UseQueryResult<Company, AxiosError> => {
  const axios = useAxios();
  return useQuery<Company, Error>(
    'company',
    async () => {
      const { data } = await axios.get<Company>('/v1/company/');
      return data;
    },
    {
      retry: (failureCount, error) =>
        (error as AxiosError).response?.status === 404 && failureCount <= 3,
      retryDelay: (retryCount) => (retryCount === 0 ? 0 : 20000),
    }
  );
};
export default useCompanyQuery;
