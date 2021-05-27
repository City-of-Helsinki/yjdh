import { Language } from 'shared/types/common';

import { useTranslation } from '../../i18n';

const useLocale = (): Language => {
  const { i18n } = useTranslation();
  const {language} = i18n;

  switch (language) {
    case 'en':
    case 'fi':
    case 'sv':
      return language;

    default:
      return 'fi';
  }
};

export default useLocale;
