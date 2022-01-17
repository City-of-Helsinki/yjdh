import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';

import { fakeYouthFormData } from '../../src/__tests__/utils/fake-objects';
import getActivationLinkExpirationSeconds from '../../src/utils/get-activation-link-expiration-seconds';
import sendYouthApplication from '../actions/send-youth-application';
import { getActivatedPageComponents } from '../notification-page/activatedPage.components';
import { getAlreadyActivatedPageComponents } from '../notification-page/alreadyActivatedPage.components';
import { getExpiredPageComponents } from '../notification-page/expiredPage.components';
import { getThankYouPageComponents } from '../thank-you-page/thankYouPage.components';
import { clickBrowserBackButton, getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  });

test('can send application and return to front page', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const formData = fakeYouthFormData();
  await sendYouthApplication(t, formData);
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
});

if (!isRealIntegrationsEnabled()) {
  test('can send application and activate kesäseteli voucher, and reactivating goes to already activated -page', async (t) => {
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
}
