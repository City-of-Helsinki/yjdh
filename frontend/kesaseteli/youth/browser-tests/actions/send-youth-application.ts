import { Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import YouthFormData from '../../src/types/youth-form-data';
import { getIndexPageComponents } from '../index-page/indexPage.components';
import { getThankYouPageComponents } from '../thank-you-page/thankYouPage.components';

const sendYouthApplication = async (
  t: TestController,
  formData: YouthFormData,
  language?: Language
): Promise<void> => {
  const indexPage = await getIndexPageComponents(t, language);
  await indexPage.expectations.isLoaded();
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
};

export default sendYouthApplication;
