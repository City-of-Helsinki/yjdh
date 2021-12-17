import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useGetLanguage from 'shared/hooks/useGetLanguage';

const useSchoolListQuery = (): UseQueryResult<string[], Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const getLanguage = useGetLanguage();
  return useQuery(BackendEndpoint.SCHOOLS, {
    staleTime: Infinity,
    onError: (error) => handleError(error, t, router, getLanguage()),
  });
};

export default useSchoolListQuery;
