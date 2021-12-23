import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { fakeYouthFormData } from '../../src/__tests__/utils/fake-objects';
import { getThankYouPageComponents } from '../thank-you-page/thankYouPage.components';
import { getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  });

test('can fill up youth application', async (t) => {
  const indexPage = await getIndexPageComponents(t);
  await indexPage.expectations.isLoaded();
  const formData = fakeYouthFormData();
  await indexPage.actions.typeInput('first_name', formData.first_name);
  await indexPage.actions.typeInput('last_name', formData.last_name);
  await indexPage.actions.typeInput(
    'social_security_number',
    formData.social_security_number
  );
  await indexPage.actions.typeAndSelectSchoolFromDropdown(
    formData.selectedSchool?.name ?? ''
  );
  if (formData.is_unlisted_school) {
    await indexPage.actions.toggleUnlistedSchoolCheckbox();
    await indexPage.actions.typeInput(
      'unlistedSchool',
      formData.unlistedSchool
    );
  }
  await indexPage.actions.typeInput('phone_number', formData.phone_number);
  await indexPage.actions.typeInput('email', formData.email);
  await indexPage.actions.toggleAcceptTermsAndConditions();
  await indexPage.actions.clickSendButton();
  const thankYouPage = await getThankYouPageComponents(t);
  await thankYouPage.expectations.isLoaded();
  await thankYouPage.actions.clickGoToFrontPageButton();
  await indexPage.expectations.isLoaded();
});
