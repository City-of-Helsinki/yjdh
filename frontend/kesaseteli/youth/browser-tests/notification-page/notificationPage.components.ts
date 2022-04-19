import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import getYouthTranslationsApi from '../../src/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from '../../src/__tests__/utils/i18n/youth-translations';

type NotificationPage = keyof YouthTranslations['notificationPages'];

export const getNotificationPageComponents = async (
  t: TestController,
  page: NotificationPage,
  lang?: Language
) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
  } = getYouthTranslationsApi();
  const screen = screenContext(t);
  const selectors = {
    header() {
      return screen.findByRole('heading', {
        name: translations.notificationPages[page].title,
      });
    },
    goToFrontPageButton() {
      return screen.findByRole('button', {
        name: translations.notificationPages[page].goToFrontendPage,
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {
    async clickGoToFrontPageButton() {
      await t.click(selectors.goToFrontPageButton());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
