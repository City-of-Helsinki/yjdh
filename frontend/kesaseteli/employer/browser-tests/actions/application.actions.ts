import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { fakeContactPerson } from '@frontend/shared/src/__tests__/utils/fake-objects';
import type Application from '@frontend/shared/src/types/application';
import ContactPerson from 'shared/types/contact_person';
import TestController from 'testcafe';

import { getApplicationPageComponents } from '../application-page/applicationPage.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = { id: Application['id'] } & ContactPerson &
  SuomiFiData;

export const loginAndfillEmployerForm = async (
  t: TestController
): Promise<UserAndApplicationData> => {
  const urlUtils = getUrlUtils(t);
  const applicationPageComponents = getApplicationPageComponents(t);
  const suomiFiData = await doEmployerLogin(t);
  const applicationId = await urlUtils.expectations.urlChangedToApplicationPage(
    'fi'
  );
  if (!applicationId) {
    throw new Error('application id is missing');
  }
  if (isRealIntegrationsEnabled() && suomiFiData?.company) {
    const companyTable = await applicationPageComponents.companyTable(
      suomiFiData.company
    );
    await companyTable.expectations.isCompanyDataPresent();
  }
  const employerForm = await applicationPageComponents.employerForm();
  const employerFormData = fakeContactPerson();
  const {
    contact_person_name,
    contact_person_email,
    street_address,
    contact_person_phone_number,
  } = employerFormData;
  await employerForm.actions.fillContactPersonName(contact_person_name);
  await employerForm.actions.fillContactPersonEmail(contact_person_email);
  await employerForm.actions.fillStreetAddress(street_address);
  await employerForm.actions.fillContactPersonPhone(
    contact_person_phone_number
  );
  await employerForm.actions.clickSaveAndContinueButton();
  return { ...employerFormData, ...suomiFiData, id: applicationId };
};
