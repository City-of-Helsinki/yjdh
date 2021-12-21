import { getBackendDomain } from '@frontend/kesaseteli-shared/src/backend-api/backend-api';
import { HttpRequestHook } from '@frontend/shared/browser-tests/hooks/http-request-hook';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { fakeYouthFormData } from '../../src/__tests__/utils/fake-objects';
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
  const indexPageComponents = await getIndexPageComponents(t);
  await indexPageComponents.expectations.isPresent();
  const formData = fakeYouthFormData();
  await indexPageComponents.actions.typeInput(
    'first_name',
    formData.first_name
  );
  await indexPageComponents.actions.typeInput('last_name', formData.last_name);
  await indexPageComponents.actions.typeInput(
    'social_security_number',
    formData.social_security_number
  );
  await indexPageComponents.actions.typeAndSelectSchoolFromDropdown(
    formData.selectedSchool?.name ?? ''
  );
  if (formData.is_unlisted_school) {
    await indexPageComponents.actions.toggleUnlistedSchoolCheckbox();
    await indexPageComponents.actions.typeInput(
      'unlistedSchool',
      formData.unlistedSchool
    );
  }
  await indexPageComponents.actions.typeInput(
    'phone_number',
    formData.phone_number
  );
  await indexPageComponents.actions.typeInput('email', formData.email);
  await indexPageComponents.actions.toggleAcceptTermsAndConditions();
  await indexPageComponents.actions.clickSendButton();
  await indexPageComponents.expectations.isFormFulfilledWith(formData);
});
