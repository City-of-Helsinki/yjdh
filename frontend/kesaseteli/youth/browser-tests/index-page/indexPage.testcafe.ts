import requestLogger from '@frontend/kesaseteli-shared/browser-tests/utils/request-logger';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getCurrentUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';

import { fakeYouthFormData } from '../../src/__tests__/utils/fake-objects';
import getActivationLinkExpirationSeconds from '../../src/utils/get-activation-link-expiration-seconds';
import sendYouthApplication from '../actions/send-youth-application';
import { getActivatedPageComponents } from '../notification-page/activatedPage.components';
import { getAlreadyActivatedPageComponents } from '../notification-page/alreadyActivatedPage.components';
import { getAlreadyAssignedPageComponents } from '../notification-page/alreadyAssignedPage.components';
import { getEmailInUsePageComponents } from '../notification-page/emailInUsePage.components';
import { getExpiredPageComponents } from '../notification-page/expiredPage.components';
import { getThankYouPageComponents } from '../thank-you-page/thankYouPage.components';
import {
  clickBrowserBackButton,
  getFrontendUrl,
  goToFrontPage,
} from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(requestLogger)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(requestLogger.requests)
  );

test('can send application and return to front page', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const formData = fakeYouthFormData();
  await sendYouthApplication(t, formData);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
});

test('sending two applications with same email redirects latter to email_in_use page', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const formData = fakeYouthFormData();
  await sendYouthApplication(t, formData);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
  const secondFormData = { ...fakeYouthFormData(), email: formData.email };
  await sendYouthApplication(t, secondFormData);
  const emailInUsePage = await getEmailInUsePageComponents(t);
  await emailInUsePage.expectations.isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test('activation remembers the selected language', async (t) => {
    const languageDropdown = await getHeaderComponents(t).languageDropdown();
    await languageDropdown.actions.changeLanguage(DEFAULT_LANGUAGE, 'sv');
    const indexPage = await getIndexPageComponents(t, 'sv');
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData, 'sv');
    const thankYouPage = await getThankYouPageComponents(t, 'sv');
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t, 'sv');
    await activatedPage.expectations.isLoaded();
  });

  test('activating application twice redirects to already activated -page', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const activatedPage = await getActivatedPageComponents(t);
    await activatedPage.expectations.isLoaded();

    // reactivating fails
    await clickBrowserBackButton();
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyActivatedPage = await getAlreadyActivatedPageComponents(t);
    await alreadyActivatedPage.expectations.isLoaded();
  });

  test('shows expiration page if kesäseteli is activated too late', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.actions.clickActivationLink();
    const expiredPage = await getExpiredPageComponents(t);
    await expiredPage.expectations.isLoaded();
  });

  test('sending application with already activated email redirects to already assigned -page', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await goToFrontPage(t);
    const secondFormData = { ...fakeYouthFormData(), email: formData.email };
    await sendYouthApplication(t, secondFormData);
    const alreadyAssignedPage = await getAlreadyAssignedPageComponents(t);
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('sending application with already activated ssn redirects to already assigned -page', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await goToFrontPage(t);
    const secondFormData = {
      ...fakeYouthFormData(),
      social_security_number: formData.social_security_number,
    };
    await sendYouthApplication(t, secondFormData);
    const alreadyAssignedPage = await getAlreadyAssignedPageComponents(t);
    await alreadyAssignedPage.expectations.isLoaded();
  });

  test('when activating two applications with same ssn, latter activation should redirect to already activated -page', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    await getThankYouPageComponents(t);
    const firstThankYouPageUrl = await getCurrentUrl();
    await goToFrontPage(t);
    const secondFormData = {
      ...fakeYouthFormData(),
      social_security_number: formData.social_security_number,
    };
    await sendYouthApplication(t, secondFormData);
    let thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getActivatedPageComponents(t);
    await t.navigateTo(firstThankYouPageUrl);
    thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    const alreadyActivatedPage = await getAlreadyActivatedPageComponents(t);
    await alreadyActivatedPage.expectations.isLoaded();
  });
}
