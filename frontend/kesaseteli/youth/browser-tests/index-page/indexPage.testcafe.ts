import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';

import { fakeYouthFormData } from '../../src/__tests__/utils/fake-objects';
import getActivationLinkExpirationSeconds from '../../src/utils/get-activation-link-expiration-seconds';
import sendYouthApplication from '../actions/send-youth-application';
import { getThankYouPageComponents } from '../thank-you-page/thankYouPage.components';
import { getFrontendUrl, getUrlUtils } from '../utils/url.utils';
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
  test('can send application and activate', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);
    await thankYouPage.actions.clickActivationLink();
    await getUrlUtils(t).expectations.urlChangedToActivatedPage();
  });
  test('shows expiration page if activated too late', async (t) => {
    const indexPage = await getIndexPageComponents(t);
    await indexPage.expectations.isLoaded();
    const formData = fakeYouthFormData();
    await sendYouthApplication(t, formData);
    const thankYouPage = await getThankYouPageComponents(t);

    await t.wait((getActivationLinkExpirationSeconds() + 1) * 1000);
    await thankYouPage.actions.clickActivationLink();
    await getUrlUtils(t).expectations.urlChangedToExpirationPage();
  });
}
