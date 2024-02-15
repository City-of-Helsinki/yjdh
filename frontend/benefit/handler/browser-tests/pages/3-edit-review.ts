/* eslint-disable security/detect-non-literal-fs-filename */
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import { EDIT_FORM_DATA as form } from '../constants/forms';
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

const hasValuesInReview = async (t: TestController): Promise<boolean> => {
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
  return true;
};

test('Edit done, verify changes', async (t: TestController) => {
  // Open already created form in index page
  const applicationLink = Selector('td')
    .withText('Cool Kanerva')
    .sibling('td')
    .nth(0)
    .find('a');

  await t.click(applicationLink);
  await t.expect(applicationLink.visible).ok();

  // Validate form and submit
  await hasValuesInReview(t);
});
