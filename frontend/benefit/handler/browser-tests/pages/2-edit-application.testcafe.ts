import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import format from 'date-fns/format';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { EDIT_FORM_DATA as form, NEW_FORM_DATA } from '../constants/forms';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { uploadFileAttachment } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

const clearAndFill = async (
  t: TestController,
  selector: string,
  value: string
) => {
  await t.click(selector);
  await t.selectText(selector);
  await t.pressKey('delete');
  await t.typeText(selector, value ?? '');
};

fixture('Edit existing application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Open form and edit fields, then submit', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // Open already created application in index page
  const applicationLink = Selector('td')
    .withText(
      `${NEW_FORM_DATA.employee.firstName} ${NEW_FORM_DATA.employee.lastName}`
    )
    .sibling('td')
    .nth(0)
    .find('a');
  await t.click(applicationLink);

  // // Start handling the application
  const buttonSelector = 'main button';
  const handleButton = Selector(buttonSelector).withText(
    fi.review.actions.handle
  );
  await t.expect(handleButton.visible).ok();
  await t.click(handleButton);

  // Hit the edit button on application review page
  const editButton = Selector(buttonSelector)
    .withText(fi.review.actions.edit)
    .nth(0);
  await t.expect(editButton.visible).ok();
  await t.click(editButton);

  // Company info
  await clearAndFill(
    t,
    '#companyBankAccountNumber',
    form.company.bankAccountNumber
  );
  await clearAndFill(
    t,
    '#companyContactPersonFirstName',
    form.company.firstName
  );
  await clearAndFill(t, '#companyContactPersonLastName', form.company.lastName);
  await clearAndFill(t, '#companyContactPersonPhoneNumber', form.company.phone);
  await clearAndFill(t, '#companyContactPersonEmail', form.company.email);

  // De minimis aid
  await t.click('[for="deMinimisAidTrue"]');
  await clearAndFill(t, '#granter', form.deminimis.granter);
  await clearAndFill(t, '#amount', form.deminimis.amount);
  await clearAndFill(t, '#grantedAt', form.deminimis.grantedAt);
  const addButton = Selector('main button span')
    .withText(fi.applications.sections.deMinimisAidsAdd)
    .parent();
  await t.click(addButton);

  await t.click('[for="coOperationNegotiationsTrue"]');
  await clearAndFill(
    t,
    '#coOperationNegotiationsDescription',
    form.company.coOperationNegotiationsDescription
  );

  // Employee info
  await clearAndFill(t, '[name="employee.firstName"]', form.employee.firstName);
  await clearAndFill(t, '[name="employee.lastName"]', form.employee.lastName);
  await clearAndFill(
    t,
    '[name="employee.socialSecurityNumber"]',
    form.employee.ssn
  );

  await clearAndFill(t, '[name="employee.jobTitle"]', form.employee.jobTitle);
  await clearAndFill(
    t,
    '[name="employee.workingHours"]',
    form.employee.workingHours
  );
  await clearAndFill(
    t,
    '[name="employee.collectiveBargainingAgreement"]',
    form.employee.collectiveBargainingAgreement
  );

  await clearAndFill(
    t,
    '[name="employee.monthlyPay"]',
    form.employee.monthlyPay
  );
  await clearAndFill(
    t,
    '[name="employee.vacationMoney"]',
    form.employee.vacationMoney
  );
  await clearAndFill(
    t,
    '[name="employee.otherExpenses"]',
    form.employee.otherExpenses
  );

  await t.click('[for="paySubsidyGranted.null"]');

  await clearAndFill(
    t,
    '[name="startDate"]',
    format(new Date(), DATE_FORMATS.UI_DATE)
  );

  await uploadFileAttachment(
    t,
    '#upload_attachment_employment_contract',
    'sample2.pdf'
  );

  // Validate form and submit
  const validationButton = Selector(buttonSelector).withText(
    fi.applications.actions.continue
  );
  await t.click(validationButton);

  await t.typeText('#changeReason', 'Testing edit application');

  const submitButton = Selector('[data-testid="confirm-ok"]');
  await t.click(submitButton);

  await t.expect(editButton.visible).ok();
});
