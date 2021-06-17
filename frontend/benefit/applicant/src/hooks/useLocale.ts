import { useTranslation } from 'benefit/applicant/i18n';
import { Language } from 'shared/i18n/i18n';

const useLocale = (): Language => {
  const { i18n } = useTranslation();
  const { language } = i18n;

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
