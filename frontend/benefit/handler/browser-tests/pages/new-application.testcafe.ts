import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { format } from 'date-fns';
import { ClientFunction, Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);
fixture('Index page')
  .page(url)

  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Fill in new application', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  await t.navigateTo('/new-application');

  await t
    .typeText('[class*="CompanySearch___"]', '0201256-6')
    .pressKey('enter');

  await t.typeText('#companyBankAccountNumber', 'FI81 4975 4587 0004 02');
  await t.typeText('#companyContactPersonFirstName', 'Kuura');
  await t.typeText('#companyContactPersonLastName', 'Massi-Päällikkö');
  await t.typeText('#companyContactPersonPhoneNumber', '050 000 0000');
  await t.typeText('#companyContactPersonEmail', 'hki-benefit@example.com');

  await t.click('[for="deMinimisAidFalse"]');
  await t.click('[for="coOperationNegotiationsFalse"]');

  await t.typeText('[name="employee.firstName"]', 'Ruu');
  await t.typeText('[name="employee.lastName"]', 'Rättisitikka');
  await t.typeText('[name="employee.socialSecurityNumber"]', '050632-8912');
  await t.typeText('[name="employee.phoneNumber"]', '040 123 4567');

  await t.click('[for="employee.isLivingInHelsinki"]');
  await t.click('[for="paySubsidyGrantedFalse"]');
  await t.click('[for="benefitTypeEmployment"]');

  await t.typeText(
    '[name="startDate"]',
    format(new Date(), DATE_FORMATS.UI_DATE)
  );

  await t.typeText('[name="employee.jobTitle"]', 'Verkkosamooja');
  await t.typeText('[name="employee.workingHours"]', '30');
  await t.typeText(
    '[name="employee.collectiveBargainingAgreement"]',
    'Yleinen TES'
  );

  await t.typeText('[name="employee.monthlyPay"]', '1800');
  await t.typeText('[name="employee.otherExpenses"]', '300');
  await t.typeText('[name="employee.vacationMoney"]', '100');

  await t.setFilesToUpload('#upload_attachment_full_application', 'sample.pdf');
  await t.setFilesToUpload(
    '#upload_attachment_employment_contract',
    'sample.pdf'
  );

  // Have to wait for a small time because otherwise frontend won't register the upload files and form is submitted without them
  await t.wait(250);

  const nextButton = Selector('main button span').withText('Jatka').parent();
  await t.click(nextButton);

  // Get app id from url
  const applicationId = await ClientFunction(() =>
    window.location.search.split('id=').pop()
  )();

  await t.click('[data-testid="nextButton"]');

  /* TODO: 2023-06-30 submission is broken with strange loop (see HL-864) when using build version,
   ** fix it first before getting into these:
   ** 1. Assert that we are in fact at the front page before clicking the table link
   ** 2. See to deletion, saving as draft, etc.
   */
  console.log(applicationId);
  // await t.click(`table tr a[href="/new-application?id=${applicationId}"]`);
});
