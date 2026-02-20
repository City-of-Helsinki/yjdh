import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import FakeObjectFactory from '@frontend/shared/src/__tests__/utils/FakeObjectFactory';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import Application from '@frontend/shared/src/types/application';
import Employment from '@frontend/shared/src/types/employment';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import TestController from 'testcafe';

import { getStep1Components } from '../application-page/step1.components';
import { getStep2Components } from '../application-page/step2.components';
import { getWizardComponents } from '../application-page/wizard.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = Application & SuomiFiData;

const fakeObjectFactory = new FakeObjectFactory();

export const fillEmployerDetails = async (
  t: TestController,
  application: Application
): Promise<void> => {
  const step1 = getStep1Components(t);
  const step1Form = await step1.form();
  const {
    contact_person_name,
    contact_person_email,
    street_address,
    bank_account_number,
    contact_person_phone_number,
  } = application;

  await step1Form.actions.fillContactPersonName(contact_person_name);
  await step1Form.actions.fillContactPersonEmail(contact_person_email);
  await step1Form.actions.fillContactPersonPhone(contact_person_phone_number);
  await step1Form.actions.fillStreetAddress(street_address);
  await step1Form.actions.fillBankAccountNumber(bank_account_number);
};

export const fillEmploymentDetails = async (
  t: TestController,
  application: Application,
  expectedPreFill?: {
    employee_ssn?: string;
    employee_phone_number?: string;
    employee_postcode?: string | number;
    employee_school?: string;
  }
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<void> => {
  const step1 = getStep1Components(t);
  const step1Form = await step1.form();
  const { summer_vouchers } = application;

  if (summer_vouchers.length > 0) {
    const employment = summer_vouchers[0];

    await step1Form.actions.fillEmployeeName(employment.employee_name ?? '');
    await step1Form.actions.fillSerialNumber(
      employment.summer_voucher_serial_number ?? ''
    );
    await step1Form.actions.clickFetchEmployeeDataButton();
    await step1Form.expectations.isEmploymentFieldsEnabled();
    await step1Form.expectations.isSsnFieldReadOnly();

    if (expectedPreFill) {
      await step1Form.expectations.isEmploymentFulfilledWith(expectedPreFill);
    }

    const {
      employee_ssn,
      target_group,
      employee_home_city,
      employee_postcode,
      employee_phone_number,
      employment_postcode,
      employee_school,
      employment_start_date,
      employment_end_date,
      employment_work_hours,
      employment_description,
      employment_salary_paid,
      hired_without_voucher_assessment,
    } = employment;

    if (!expectedPreFill?.employee_ssn) {
      await step1Form.actions.fillSsn(employee_ssn ?? '');
    }
    const targetGroupKey = target_group ?? 'secondary_target_group';
    await step1Form.actions.selectTargetGroup(targetGroupKey);
    await step1Form.actions.fillHomeCity(employee_home_city ?? '');
    await step1Form.actions.fillPostcode(String(employee_postcode ?? ''));
    await step1Form.actions.fillPhoneNumber(employee_phone_number ?? '');
    await step1Form.actions.fillEmploymentPostcode(
      String(employment_postcode ?? '')
    );
    await step1Form.actions.fillSchool(employee_school ?? '');

    await step1Form.actions.addEmploymentContractAttachment([
      'sample1.pdf',
      'sample2.pdf',
      'sample3.pdf',
      'sample4.pdf',
      'sample5.pdf',
    ]);

    await step1Form.actions.addPayslipAttachments([
      'sample6.pdf',
      'sample7.pdf',
    ]);

    await step1Form.actions.fillStartDate(
      convertToUIDateFormat(employment_start_date)
    );
    await step1Form.actions.fillEndDate(
      convertToUIDateFormat(employment_end_date)
    );
    await step1Form.actions.fillWorkHours(String(employment_work_hours ?? ''));
    await step1Form.actions.fillDescription(employment_description ?? '');
    await step1Form.actions.fillSalary(String(employment_salary_paid ?? ''));
    await step1Form.actions.selectHiredWithoutVoucherAssessment(
      hired_without_voucher_assessment ?? 'maybe'
    );
  }
};

export const fillStep1Form = async (
  t: TestController,
  application: Application,
  expectedPreFill?: {
    employee_ssn?: string;
    employee_phone_number?: string;
    employee_postcode?: string | number;
    employee_school?: string;
  }
): Promise<void> => {
  await fillEmployerDetails(t, application);
  await fillEmploymentDetails(t, application, expectedPreFill);
};

export const loginAndfillApplication = async (
  t: TestController,
  toStep = 2,
  expectedPreFill?: {
    employee_ssn?: string;
    employee_phone_number?: string;
    employee_postcode?: string | number;
    employee_school?: string;
  }
): Promise<UserAndApplicationData> => {
  const urlUtils = getUrlUtils(t);
  const suomiFiData = await doEmployerLogin(t);
  const wizard = await getWizardComponents(t);
  const applicationId =
    await urlUtils.expectations.urlChangedToApplicationPage();
  const application = fakeObjectFactory.fakeApplication(
    suomiFiData.company,
    'fi',
    applicationId
  );

  if (expectedPreFill && application.summer_vouchers.length > 0) {
    application.summer_vouchers[0] = {
      ...application.summer_vouchers[0],
      ...expectedPreFill,
    } as unknown as Employment;
  }

  // if there is existing draft application on step 2, then move to step 1.
  await wizard.actions.clickGoToStep1Button();

  if (toStep >= 1) {
    if (isRealIntegrationsEnabled()) {
      const companyTable = await getStep1Components(t).companyTable(
        application.company
      );
      await companyTable.expectations.isCompanyDataPresent();
    }
    await fillStep1Form(t, application, expectedPreFill);
    await wizard.actions.clickSaveAndContinueButton();
  }

  if (toStep === 2) {
    const step2 = getStep2Components(t);
    const summary = await step2.summaryComponent();
    if (isRealIntegrationsEnabled()) {
      await summary.expectations.isCompanyDataPresent(application.company);
    }
    await summary.expectations.isFulFilledWith(application);

    const step2Form = await step2.form();
    await step2Form.actions.toggleAcceptTermsAndConditions();
    await wizard.actions.clickSendButton();
  }
  return { ...application, ...suomiFiData };
};
