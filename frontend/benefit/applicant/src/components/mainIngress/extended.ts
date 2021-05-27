import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';

import { useTranslation } from '../../../i18n';

type ExtendedComponentProps = {
  handleMoreInfoClick: () => void;
  t: TFunction
}

const useComponent = (): ExtendedComponentProps => {

  const { t } = useTranslation();
  const router = useRouter();

  const handleMoreInfoClick = (): void => {
    router.push('/')
  };

  return { handleMoreInfoClick, t }
}

export { useComponent }