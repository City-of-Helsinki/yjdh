import { useTranslation } from '../../i18n';
import { Language } from 'shared/types/common';

const useLocale = (): Language => {
  const { i18n } = useTranslation();
  const language = i18n.language;

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
