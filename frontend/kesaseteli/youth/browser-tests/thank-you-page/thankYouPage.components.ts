import {
  screenContext,
  setDataToPrintOnFailure,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import { getNotificationPageComponents } from '../notification-page/notificationPage.components';

export const getThankYouPageComponents = async (
  t: TestController,
  lang?: Language
) => {
  const screen = screenContext(t);
  const notificationPage = await getNotificationPageComponents(
    t,
    'thankyou',
    lang
  );
  const selectors = {
    ...notificationPage.selectors,
    activationLink() {
      return screen.findByRole('link', {
        name: /aktivoi/i,
      });
    },
  };
  const expectations = {
    ...notificationPage.expectations,
  };
  const actions = {
    ...notificationPage.actions,
    async clickActivationLink() {
      const href = await selectors.activationLink().getAttribute('href');
      setDataToPrintOnFailure(t, 'activationLink', href);
      // eslint-disable-next-line no-console
      console.log('Clicking activation link', href);
      await t.click(selectors.activationLink());
    },
  };
  await notificationPage.expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
