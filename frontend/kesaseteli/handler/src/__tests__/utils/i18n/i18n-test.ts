import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

import fi from '../../../../public/locales/fi/common.json';

void i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  react: {
    useSuspense: false,
  },
  resources: {
    [DEFAULT_LANGUAGE]: {
      common: fi,
    },
  },
});

export default i18n;
