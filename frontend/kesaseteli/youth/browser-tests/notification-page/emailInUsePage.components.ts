import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import getYouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import { getNotificationPageComponents } from './notificationPage.components';

export const getEmailInUsePageComponents = async (
  t: TestController,
  lang?: Language
) => {
  const translations = await getYouthTranslations(lang);
  return getNotificationPageComponents(t, {
    headerText: translations.emailInUsePage.title,
  });
};
