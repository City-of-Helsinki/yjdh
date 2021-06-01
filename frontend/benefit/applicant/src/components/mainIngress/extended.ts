import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

type ExtendedComponentProps = {
  handleMoreInfoClick: () => void;
  t: TFunction;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleMoreInfoClick = (): void => {
    void router.push('/');
  };

  return { handleMoreInfoClick, t };
};

export { useComponent };
