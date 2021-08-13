import { ROUTES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

type ExtendedComponentProps = {
  handleBackClick: () => void;
  t: TFunction;
};

const useErrorPage = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBackClick = (): void => {
    void router.push(ROUTES.HOME);
  };

  return { t, handleBackClick };
};

export { useErrorPage };
