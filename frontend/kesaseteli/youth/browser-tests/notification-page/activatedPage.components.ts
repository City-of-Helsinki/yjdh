import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import { getNotificationPageComponents } from './notificationPage.components';

const translations = {
  fi: {
    headerText: /kesäsetelisi on nyt aktivoitu/i,
  },
  sv: {
    headerText: /sv kesäsetelisi on nyt aktivoitu/i,
  },
  en: {
    headerText: /eng kesäsetelisi on nyt aktivoitu/i,
  },
};

export const getActivatedPageComponents = async (
  t: TestController,
  lang?: Language
) =>
  getNotificationPageComponents(t, {
    headerText: translations[lang ?? DEFAULT_LANGUAGE].headerText,
  });
