import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import getTranslations from '../../src/__tests__/utils/i18n/get-translations';
import { getNotificationPageComponents } from './notificationPage.components';

export const getActivatedPageComponents = async (
  t: TestController,
  lang?: Language
) => {
  const translations = await getTranslations(lang);
  return getNotificationPageComponents(t, {
    headerText: translations.activatedPage.notificationTitle,
  });
};
