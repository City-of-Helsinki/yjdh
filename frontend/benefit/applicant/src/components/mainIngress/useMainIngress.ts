import { ROUTES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

type ExtendedComponentProps = {
  handleNewApplicationClick: () => void;
  handleMoreInfoClick: () => void;
  t: TFunction;
};

const useMainIngress = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleMoreInfoClick = (): void => {
    // todo: redirect to more info url
    void router.push(ROUTES.HOME);
  };

  const handleNewApplicationClick = (): void => {
    void router.push(ROUTES.APPLICATION_FORM);
  };

  return { handleNewApplicationClick, handleMoreInfoClick, t };
};

export { useMainIngress };
