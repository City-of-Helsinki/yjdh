import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { format } from 'date-fns';
import { Selector } from 'testcafe';

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

  await t.navigateTo('/application/new');

  const searchCompanyInput = Selector(
    '[data-testid="company-search-input"]'
  ).find('input');
  await t.typeText(searchCompanyInput, '0201256-6').pressKey('enter');

  await t.typeText('#companyBankAccountNumber', 'FI81 4975 4587 0004 02');
  await t.typeText('#companyContactPersonFirstName', 'Kuura');
  await t.typeText('#companyContactPersonLastName', 'Massi-Päällikkö');
  await t.typeText('#companyContactPersonPhoneNumber', '050 000 0000');
  await t.typeText('#companyContactPersonEmail', 'hki-benefit@example.com');

  await t.click('[for="deMinimisAidTrue"]');
  await t.typeText('#granter', 'Valtio');
  await t.typeText('#amount', '2000');
  await t.typeText('#grantedAt', '27.9.2023');
  const addButton = Selector('main button span').withText('Lisää').parent();
  await t.click(addButton);

  await t.click('[for="coOperationNegotiationsTrue"]');
  await t.typeText('#coOperationNegotiationsDescription', 'Tilanne');

  await t.typeText('[name="employee.firstName"]', 'Ruu');
  await t.typeText('[name="employee.lastName"]', 'Rättisitikka');
  await t.typeText('[name="employee.socialSecurityNumber"]', '050632-8912');
  await t.click('[for="employee.isLivingInHelsinki"]');

  await t.typeText('[name="employee.jobTitle"]', 'Verkkosamooja');
  await t.typeText('[name="employee.workingHours"]', '30');
  await t.typeText(
    '[name="employee.collectiveBargainingAgreement"]',
    'Yleinen TES'
  );

  await t.typeText('[name="employee.monthlyPay"]', '1800');
  await t.typeText('[name="employee.vacationMoney"]', '100');
  await t.typeText('[name="employee.otherExpenses"]', '300');

  await t.click('[for="paySubsidyGranted.granted"]');
  await t.click('[for="apprenticeshipProgramFalse"]');

  await t.typeText(
    '[name="startDate"]',
    format(new Date(), DATE_FORMATS.UI_DATE)
  );

  await t.setFilesToUpload('#upload_attachment_full_application', 'sample.pdf');
  await t.setFilesToUpload(
    '#upload_attachment_employment_contract',
    'sample.pdf'
  );

  // Have to wait for a small time because otherwise frontend won't register the upload files and form is submitted without them
  await t.wait(250);

  const nextButton = Selector('main button span')
    .withText('Tallenna luonnoksena ja sulje')
    .parent();
  await t.click(nextButton);

  const newApplicationButton = Selector('button').withAttribute(
    'data-testid',
    'new-application-button'
  );
  await t.expect(newApplicationButton.exists).ok();
});
