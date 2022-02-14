import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

const translations = {
  fi: {
    headerText: /vahvistus onnistui/i,
  },
  sv: {
    headerText: /bekräftelsen lyckades/i,
  },
  en: {
    headerText: /confirmation succeeded/i,
  },
};

export const getActivatedPageComponents = async (
  t: TestController,
  lang?: Language
) =>
  getNotificationPageComponents(t, {
    headerText: translations[lang ?? DEFAULT_LANGUAGE].headerText,
  });
