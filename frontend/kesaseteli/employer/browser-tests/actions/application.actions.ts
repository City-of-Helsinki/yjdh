import type { SuomiFiData } from '@frontend/shared/browser-tests/actions/login-action';
import FakeObjectFactory from '@frontend/shared/src/__tests__/utils/FakeObjectFactory';
import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';
import type Application from '@frontend/shared/src/types/application';
import Employment from '@frontend/shared/src/types/employment';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import TestController from 'testcafe';

import { getStep1Components } from '../application-page/step1.components';
import { getStep2Components } from '../application-page/step2.components';
import { getStep3Components } from '../application-page/step3.components';
import { getWizardComponents } from '../application-page/wizard.components';
import { getUrlUtils } from '../utils/url.utils';
import { doEmployerLogin } from './employer-header.actions';

type UserAndApplicationData = Application & SuomiFiData;

const fakeObjectFactory = new FakeObjectFactory();

export const fillStep1Form = async (
  t: TestController,
  application: Application
): Promise<void> => {
  const step1Form = await getStep1Components(t).form();
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

export const removeStep2ExistingForms = async (
  t: TestController
): Promise<void> => {
  const step2 = getStep2Components(t);
  const form = await step2.form();
  await form.actions.openAllClosedAccordions();
  await form.actions.removeAllAccordions();
};
export const fillStep2EmployeeForm = async (
  t: TestController,
  employment: Employment,
  index = 0
): Promise<void> => {
  const step2 = getStep2Components(t);

  const addButton = await step2.addEmploymentButton();
  await addButton.actions.click();
  const step2Employment = await step2.employmentAccordion(index);
  await step2Employment.actions.fillEmployeeName(employment.employee_name);
  await step2Employment.actions.fillSsn(employment.employee_ssn);
  await step2Employment.actions.selectGradeOrBirthYear(
    employment.summer_voucher_exception_reason
  );
  await step2Employment.actions.fillHomeCity(employment.employee_home_city);
  await step2Employment.actions.fillPostcode(employment.employee_postcode);
  await step2Employment.actions.fillPhoneNumber(
    employment.employee_phone_number
  );
  await step2Employment.actions.fillEmploymentPostcode(
    employment.employment_postcode
  );
  await step2Employment.actions.fillSchool(employment.employee_school);
  if (employment.summer_voucher_exception_reason === '9th_grader') {
    await step2Employment.actions.fillSerialNumber(
      employment.summer_voucher_serial_number
    );
  }
  await step2Employment.actions.removeExistingAttachments();
  await Promise.all(
    employment.employment_contract.map(async (attachment) =>
      step2Employment.actions.addEmploymentContractAttachment(attachment)
    )
  );
  await Promise.all(
    employment.payslip.map(async (attachment) =>
      step2Employment.actions.addPayslipAttachments(attachment)
    )
  );
  await step2Employment.actions.fillStartDate(
    convertToUIDateFormat(employment.employment_start_date)
  );
  await step2Employment.actions.fillEndDate(
    convertToUIDateFormat(employment.employment_end_date)
  );
  await step2Employment.actions.fillWorkHours(employment.employment_work_hours);
  await step2Employment.actions.fillDescription(
    employment.employment_description
  );
  await step2Employment.actions.fillSalary(employment.employment_salary_paid);
  await step2Employment.actions.selectHiredWithoutVoucherAssessment(
    employment.hired_without_voucher_assessment
  );
  await step2Employment.actions.clickSaveEmployeeButton();
};

export const loginAndfillApplication = async (
  t: TestController,
  toStep = 3
): Promise<UserAndApplicationData> => {
  const urlUtils = getUrlUtils(t);
  const suomiFiData = await doEmployerLogin(t);
  const wizard = await getWizardComponents(t);
  const applicationId =
    await urlUtils.expectations.urlChangedToApplicationPage();
  const application = fakeObjectFactory.fakeApplication(
    suomiFiData?.company,
    'fi',
    applicationId
  );
  // if there is existing draft application on step 2 or 3, then move to step 1.
  await wizard.actions.clickGoToStep1Button();
  if (toStep >= 1) {
    if (isRealIntegrationsEnabled()) {
      const companyTable = await getStep1Components(t).companyTable(
        application.company
      );
      await companyTable.expectations.isCompanyDataPresent();
    }
    await fillStep1Form(t, application);
    await wizard.actions.clickSaveAndContinueButton();
  }
  if (toStep >= 2) {
    await removeStep2ExistingForms(t);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < application.summer_vouchers.length; i++) {
      const employment = application.summer_vouchers[i];
      // eslint-disable-next-line no-await-in-loop
      await fillStep2EmployeeForm(t, employment, i);
    }
    await wizard.actions.clickSaveAndContinueButton();
  }
  if (toStep === 3) {
    const step3 = getStep3Components(t);
    const employerSummary = await step3.summaryComponent();
    if (isRealIntegrationsEnabled()) {
      await employerSummary.expectations.isCompanyDataPresent(
        application.company
      );
    }
    await employerSummary.expectations.isFulFilledWith(application);
    const step3Form = await step3.form();
    await step3Form.actions.toggleAcceptTermsAndConditions();
    await wizard.actions.clickSendButton();
  }
  return { ...application, ...suomiFiData };
};
