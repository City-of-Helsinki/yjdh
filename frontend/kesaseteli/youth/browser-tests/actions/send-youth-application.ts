import YouthApplication from '@frontend/kesaseteli-shared/src/types/youth-application';
import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import { getIndexPageComponents } from '../index-page/indexPage.components';

const sendYouthApplication = async (
  t: TestController,
  application: YouthApplication,
  language?: Language
): Promise<void> => {
  const indexPage = await getIndexPageComponents(t, language);
  await indexPage.expectations.isLoaded();
  await indexPage.actions.typeInput('first_name', application.first_name);
  await indexPage.actions.typeInput('last_name', application.last_name);
  await indexPage.actions.typeInput(
    'social_security_number',
    application.social_security_number
  );
  await indexPage.actions.typeAndSelectSchoolFromDropdown(
    application.school ?? ''
  );
  await indexPage.actions.typeInput('postcode', application.postcode);
  if (application.is_unlisted_school) {
    await indexPage.actions.toggleCheckbox('is_unlisted_school');
    await indexPage.actions.typeInput('unlistedSchool', application.school);
  }
  await indexPage.actions.typeInput('phone_number', application.phone_number);
  await indexPage.actions.typeInput('email', application.email);
  await indexPage.actions.toggleCheckbox('termsAndConditions');
  await indexPage.actions.clickSendButton();
};

export default sendYouthApplication;
