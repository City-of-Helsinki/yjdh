import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import isRealIntegrationsEnabled from '@frontend/shared/browser-tests/utils/is-real-integrations-enabled';
import { fakeApplication } from '@frontend/shared/src/__tests__/utils/fake-objects';
import type Application from '@frontend/shared/src/types/application';
import ContactPerson from '@frontend/shared/src/types/contact_person';
import TestController from 'testcafe';

import { getApplicationPageComponents } from '../application-page/applicationPage.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = { id: Application['id'] } & ContactPerson &
  SuomiFiData;

export const fillStep1Form = async (
  t: TestController,
  application: Application
): Promise<void> => {
  const step1 = await getApplicationPageComponents(t).step1();
  const {
    contact_person_name,
    contact_person_email,
    street_address,
    contact_person_phone_number,
  } = application;
  await step1.actions.fillContactPersonName(contact_person_name);
  await step1.actions.fillContactPersonEmail(contact_person_email);
  await step1.actions.fillStreetAddress(street_address);
  await step1.actions.fillContactPersonPhone(contact_person_phone_number);
  await step1.actions.clickSaveAndContinueButton();
};

export const fillStep2Form = async (
  t: TestController,
  application: Application,
  index = 0
): Promise<void> => {
  const step2 = await getApplicationPageComponents(t).step2(index);
  const { employment_contract, payslip } = application.summer_vouchers[index];

  await Promise.all(
    employment_contract.map(async (attachment) =>
      step2.actions.addEmploymentContractAttachment(attachment)
    )
  );
  await Promise.all(
    payslip.map(async (attachment) =>
      step2.actions.addPayslipAttachments(attachment)
    )
  );
};

export const loginAndfillApplication = async (
  t: TestController,
  toStep = 3
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
  const application = fakeApplication(applicationId, suomiFiData?.company);

  if (isRealIntegrationsEnabled()) {
    const companyTable = await applicationPageComponents.companyTable(
      application.company
    );
    await companyTable.expectations.isCompanyDataPresent();
  }
  if (toStep >= 1) {
    await fillStep1Form(t, application);
  }
  if (toStep >= 2) {
    await fillStep2Form(t, application, 0);
  }
  return { ...application, ...suomiFiData };
};
