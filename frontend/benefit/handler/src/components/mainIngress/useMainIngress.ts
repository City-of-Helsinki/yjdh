import { TFunction, useTranslation } from 'next-i18next';

type ExtendedComponentProps = {
  t: TFunction;
};

const useMainIngress = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  return { t };
};

export { useMainIngress };
