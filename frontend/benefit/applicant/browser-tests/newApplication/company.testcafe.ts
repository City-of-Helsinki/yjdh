import { Selector } from 'testcafe';
import applicationsList from '../page-modal/applicationsList';
import step1 from '../page-modal/step1';
import step2 from '../page-modal/step2';
import step3 from '../page-modal/step3';
import company from '../roles/company';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl('/');

fixture`Company: New application`.page`${url}`;

test('Oppisopimus', async (t) => {
  await t.useRole(company);

  await applicationsList.createNewApplication();

  await t.expect(Selector('h1').withText('Uusi hakemus').exists).ok();

  await step1.fillEmployerInfo('6051437344779954');
  await step1.fillContactPerson(
    'Raven',
    'Stamm',
    '050001234',
    'Raven_Stamm@example.net'
  );
  await step1.selectNoDeMinimis();
  await step1.selectNocoOperationNegotiations();
  await step1.submit();

  await t.expect(step2.currentStep.exists).ok();

  await step2.fillEmployeeInfo('Larry', 'Blick', '010101-150J', '040444321');
  await step2.fillPaidSubsidyGrant();
  await step2.selectBenefitType('salary');
  await step2.fillBenefitPeriod('1.3.2021', '28.2.2022');
  await step2.fillEmploymentInfo(
    'Kuljettaja',
    '30',
    'Logistiikka TES',
    '2300',
    '2300',
    '500'
  );
  await step2.submit();

  await t.expect(Selector('h1').withText('Hakemus').exists).ok();

  await step3.employmentContractNeeded();
  await step3.paySubsidyDecisionNeeded();
  await step3.helsinkiBenefitVoucherNeeded();

  await step3.delete();
});
