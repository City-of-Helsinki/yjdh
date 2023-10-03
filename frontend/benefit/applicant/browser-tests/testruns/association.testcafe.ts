import { HttpRequestHook } from '@frontend/shared/browser-tests/http-utils/http-request-hook';
import requestLogger, {
  filterLoggedRequests,
} from '@frontend/shared/browser-tests/utils/request-logger';
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import MainIngress from '../page-model/MainIngress';
import Step1 from '../page-model/step1';
import Step2 from '../page-model/step2';
import Step3 from '../page-model/step3';
import TermsOfService from '../page-model/TermsOfService';
import { getBackendDomain, getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture('Association')
  .page(url)
  .requestHooks(requestLogger, new HttpRequestHook(url, getBackendDomain()))
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
  })
  .afterEach(async () =>
    // eslint-disable-next-line no-console
    console.log(filterLoggedRequests(requestLogger))
  );

test.skip('New application', async () => {
  const termsAndConditions = new TermsOfService();
  await termsAndConditions.isLoaded();
  await termsAndConditions.clickContinueButton();

  const mainIngress = new MainIngress();
  await mainIngress.isLoaded();
  await mainIngress.clickCreateNewApplicationButton();

  const step1 = new Step1();
  await step1.isLoaded(60_000);

  await step1.fillEmployerInfo('3943561142000926', true);
  await step1.fillContactPerson(
    'Waild',
    'Ömoussons',
    '0400123456',
    'need.email@example.com'
  );

  await step1.selectNocoOperationNegotiations();
  await step1.clickSubmit();

  const step2 = new Step2();
  await step2.isLoaded();

  await step2.fillEmployeeInfo('Truu', 'Koos', '121148-8060');
  await step2.fillPaidSubsidyGrant();
  const currentYear: number = new Date().getFullYear();
  await step2.fillBenefitPeriod(
    `1.3.${currentYear}`,
    `28.2.${currentYear + 1}`
  );
  await step2.fillEmploymentInfo(
    'Kirjanpitäjä',
    '37',
    'Taloushallintoalan TES',
    '2050',
    '400',
    '600'
  );
  await step2.clickSubmit();

  const step3 = new Step3();
  await step3.isLoaded();
  await step3.employmentContractNeeded();
  await step3.paySubsidyDecisionNeeded();
  await step3.helsinkiBenefitVoucherNeeded();

  await step3.clickDeleteApplication();
  await step3.confirmDeleteApplication();
});
