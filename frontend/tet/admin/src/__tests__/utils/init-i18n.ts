import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

import common from '../../../public/locales/fi/common.json';

const translations = {
  common,
};

void i18n.use(initReactI18next).init({
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  resources: {
    [DEFAULT_LANGUAGE]: {
      ...translations,
    },
  },
});

export default i18n;
