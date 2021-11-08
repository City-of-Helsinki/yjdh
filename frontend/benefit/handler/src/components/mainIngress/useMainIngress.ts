import { useTranslation } from 'benefit/applicant/i18n';
import { TFunction } from 'next-i18next';

type ExtendedComponentProps = {
  t: TFunction;
};

const useMainIngress = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  return { t };
};

export { useMainIngress };
