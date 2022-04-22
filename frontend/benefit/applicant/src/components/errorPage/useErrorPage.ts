import { ROUTES } from 'benefit/applicant/constants';
import useLogout from 'benefit/applicant/hooks/useLogout';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

type ExtendedComponentProps = {
  handleBackClick: () => void;
  handleLogout: () => void;
  t: TFunction;
};

const useErrorPage = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useLogout();

  const handleBackClick = (): void => {
    void router.push(ROUTES.HOME);
  };

  return { t, handleBackClick, handleLogout: () => logout() };
};

export { useErrorPage };
