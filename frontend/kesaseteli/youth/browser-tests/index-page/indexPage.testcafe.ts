import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { fakeYouthApplication } from '../../src/__tests__/utils/fake-objects';
import { getFrontendUrl } from '../utils/url.utils';
import { getIndexPageComponents } from './indexPage.components';

const url = getFrontendUrl('/');

fixture('Frontpage')
  .page(url)
  .requestHooks(new HttpRequestHook(url))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  });

test('can fill up youth application', async (t) => {
  const indexPageComponents = await getIndexPageComponents(t);
  await indexPageComponents.expectations.isPresent();
  const application = fakeYouthApplication();
  await indexPageComponents.actions.typeInput(
    'first_name',
    application.first_name
  );
  await indexPageComponents.actions.typeInput(
    'last_name',
    application.last_name
  );
  await indexPageComponents.actions.typeInput(
    'social_security_number',
    application.social_security_number
  );
  await indexPageComponents.actions.typeInput('postcode', application.postcode);
  await indexPageComponents.actions.typeAndSelectSchoolFromDropdown(
    application.school
  );
  if (application.is_unlisted_school) {
    await indexPageComponents.actions.toggleUnlistedSchoolCheckbox();
    await indexPageComponents.actions.typeInput(
      'unlisted_school',
      application.unlisted_school
    );
  }
  await indexPageComponents.actions.typeInput(
    'phone_number',
    application.phone_number
  );
  await indexPageComponents.actions.typeInput('email', application.email);
  await indexPageComponents.actions.toggleAcceptTermsAndConditions();
  await indexPageComponents.actions.clickSendButton();
  await indexPageComponents.expectations.isApplicationFulfilledWith(
    application
  );
});
