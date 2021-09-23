import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { fakeContactPerson } from '@frontend/shared/src/__tests__/utils/fake-objects';
import type Application from '@frontend/shared/src/types/application';
import ContactPerson from '@frontend/shared/src/types/contact_person';
import TestController from 'testcafe';

import { getApplicationPageComponents } from '../application-page/applicationPage.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = { id: Application['id'] } & ContactPerson &
  SuomiFiData;

export const loginAndfillStep1Form = async (
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
  const step1 = await applicationPageComponents.step1();
  const contactPerson = fakeContactPerson();
  const {
    contact_person_name,
    contact_person_email,
    street_address,
    contact_person_phone_number,
  } = contactPerson;
  await step1.actions.fillContactPersonName(contact_person_name);
  await step1.actions.fillContactPersonEmail(contact_person_email);
  await step1.actions.fillStreetAddress(street_address);
  await step1.actions.fillContactPersonPhone(contact_person_phone_number);
  await step1.actions.clickSaveAndContinueButton();
  return { ...contactPerson, ...suomiFiData, id: applicationId };
};
