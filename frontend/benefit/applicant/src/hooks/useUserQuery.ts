import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

const useUserQuery = <T = User>(
  select?: (user: User) => T
): UseQueryResult<T, Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = router.query;
  const locale = useLocale();
  const { axios, handleResponse } = useBackendAPI();

  const handleError = (error: Error): void => {
    if (logout) {
      void router.push(`${locale}/login?logout=true`);
    } else if (/40[13]/.test(error.message)) {
      void router.push(`${locale}/login`);
    } else {
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      );
    }
  };

  return useQuery(
    `${BackendEndpoint.USER}`,
    () => handleResponse<User>(axios.get(BackendEndpoint.USER)),
    {
      enabled: !logout,
      onError: (error) => handleError(error),
      retry: false,
      select,
    }
  );
};
export default useUserQuery;
