import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { convertToUIDateFormat } from '@frontend/shared/src/utils/date.utils';
import addDays from 'date-fns/addDays';
import subMonths from 'date-fns/subMonths';
import { t } from 'testcafe';

import DeMinimisAid from '../page-model/deminimis';
import Login from '../page-model/login';
import MainIngress from '../page-model/MainIngress';
import Step1 from '../page-model/step1';
import Step2 from '../page-model/step2';
import Step3 from '../page-model/step3';
import Step4 from '../page-model/step4';
import Step5 from '../page-model/step5';
import Step6 from '../page-model/step6';
import TermsOfService from '../page-model/TermsOfService';
import { ApplicationFormData } from '../types';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture('Company')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (testController) => {
    clearDataToPrintOnFailure(testController);
  });

const currentDate = new Date().setUTCDate(1);
const startDate = subMonths(currentDate, 3);
const endDate = addDays(startDate, 30);

const form: ApplicationFormData = {
  organization: {
    iban: '6051437344779954',
    firstName: 'Raven',
    lastName: 'Stamm',
    phone: '050001234',
    email: 'Raven_Stamm@example.net',
    coOperationNegotiationsDescription: 'Lorem ipsum dolor sit amet',
  },
  employee: {
    firstName: 'Larry',
    lastName: 'Blick',
    ssn: '010101-150J',
    title: 'Kuljettaja',
    workHours: '30',
    collectiveBargainingAgreement: 'Logistiikka TES',
    monthlyPay: '2300',
    otherExpenses: '300',
    vacationMoney: '500',
    startDate: convertToUIDateFormat(startDate),
    endDate: convertToUIDateFormat(endDate),
  },
  deMinimisAid: {
    granter: 'One',
    amount: '123',
    grantedAt: '1.1.2023',
  },
};

test('New application', async () => {
  await t.click(Login.loginButton);

  const termsAndConditions = new TermsOfService();
  await termsAndConditions.isLoaded();
  await termsAndConditions.clickContinueButton();

  const mainIngress = new MainIngress();
  await mainIngress.isLoaded();
  await mainIngress.clickCreateNewApplicationButton();

  const step1 = new Step1();
  await step1.isLoaded(60_000);
  const step2 = new Step2();

  await step1.fillEmployerInfo(form.organization.iban, false);
  await step1.fillContactPerson(
    form.organization.firstName,
    form.organization.lastName,
    form.organization.phone,
    form.organization.email
  );

  await step1.selectDeMinimis(true);
  const deminimisAid = new DeMinimisAid(t, step1, step2);
  await deminimisAid.actions.fillRows(t, [
    {
      granter: form.deMinimisAid.granter,
      amount: form.deMinimisAid.amount,
      grantedAt: form.deMinimisAid.grantedAt,
    },
  ]);

  await step1.selectCoOperationNegotiations(true);
  await step1.fillCoOperationNegotiationsDescription(
    form.organization.coOperationNegotiationsDescription
  );

  await step1.clickSubmit();

  await step2.isLoaded();
  await step2.fillEmployeeInfo(
    form.employee.firstName,
    form.employee.lastName,
    form.employee.ssn
  );
  await step2.fillEmploymentInfo(
    form.employee.title,
    form.employee.workHours,
    form.employee.collectiveBargainingAgreement,
    form.employee.monthlyPay,
    form.employee.otherExpenses,
    form.employee.vacationMoney
  );
  await step2.fillPaidSubsidyGrant(true);

  await step2.fillBenefitPeriod(form.employee.startDate, form.employee.endDate);

  await step2.clickSubmit();

  const step3 = new Step3();
  await step3.isLoaded();
  await step3.employmentContractNeeded();
  await step3.paySubsidyDecisionNeeded();
  await step3.helsinkiBenefitVoucherNeeded();
  await step3.stageUploadFiles('sample.pdf', [
    '#upload_attachment_employment_contract',
    '#upload_attachment_pay_subsidy_decision',
    '#upload_attachment_education_contract',
    '#upload_attachment_helsinki_benefit_voucher',
  ]);
  await step3.clickSubmit();

  const step4 = new Step4();
  await step4.isLoaded();
  await step4.employeeConsentNeeded();
  await step4.stageUploadFiles('sample.pdf');

  await step4.clickSubmit();

  const step5 = new Step5(form);
  await step5.isLoaded();

  await step5.fieldsExistFor('company');
  await step5.clickSubmit();

  const step6 = new Step6();
  await step6.isLoaded();

  await step6.checkApplicantTerms();
  await step6.clickSubmit();
  await step6.isShowingSubmitSuccess();
});
