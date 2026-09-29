import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { friendlyFormatIBAN } from 'ibantools';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { EDIT_FORM_DATA as form } from '../constants/forms';
import { getApplicationLinkByEmployeeName } from '../utils/application';
import handlerUser from '../utils/handlerUser';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('Review edited application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

const hasCompanyValuesInReview = async (
  t: TestController
): Promise<boolean> => {
  await t
    .expect(
      Selector('main').withText(
        `${form.company.firstName} ${form.company.lastName}`
      ).exists
    )
    .ok();
  await t
    .expect(
      Selector('main').withText(form.company.phone.replace(/\s+/g, '')).exists
    )
    .ok();
  await t.expect(Selector('main').withText(form.company.email).exists).ok();
  await t
    .expect(
      Selector('main').withText(form.company.coOperationNegotiationsDescription)
        .exists
    )
    .ok();
  await t
    .expect(
      Selector('main').withText(
        String(friendlyFormatIBAN(form.company.bankAccountNumber))
      ).exists
    )
    .ok();
  return true;
};

const hasEmployeeValuesInReview = async (
  t: TestController
): Promise<boolean> => {
  await t
    .expect(
      Selector('main').withText(
        `${form.employee.firstName} ${form.employee.lastName}`
      ).exists
    )
    .ok();
  await t.expect(Selector('main').withText(form.employee.ssn).exists).ok();
  await t
    .expect(
      Selector('main').withText(form.employee.collectiveBargainingAgreement)
        .exists
    )
    .ok();
  await t.expect(Selector('main').withText(form.employee.jobTitle).exists).ok();
  await t
    .expect(
      Selector('main').withText(
        fi.applications.sections.fields.paySubsidyGranted.notGranted
      ).exists
    )
    .ok();
  return true;
};

test('Edit done, verify changes', async (t: TestController) => {
  // Open already created application in index page

  const applicationLink = getApplicationLinkByEmployeeName(
    `${form.employee.firstName} ${form.employee.lastName}`
  );

  await t.expect(applicationLink.visible).ok();
  await t.click(applicationLink);

  // Validate form and submit
  await hasCompanyValuesInReview(t);
  await hasEmployeeValuesInReview(t);
});
