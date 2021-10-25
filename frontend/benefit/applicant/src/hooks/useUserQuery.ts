import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import useLogoutQuery from 'benefit/applicant/hooks/useLogoutQuery';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

const useUserQuery = <T = User>(
  select?: (user: User) => T
): UseQueryResult<T, Error> => {
  const logoutQuery = useLogoutQuery();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const { axios, handleResponse } = useBackendAPI();

  return useQuery(
    `${BackendEndpoint.USER}`,
    () => handleResponse<User>(axios.get(BackendEndpoint.USER)),
    {
      enabled: !logoutQuery.isLoading,
      onError: (error) => handleError(error, t, router, locale),
      select,
    }
  );
};
export default useUserQuery;
