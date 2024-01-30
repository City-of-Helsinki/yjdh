import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { format } from 'date-fns';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { getFrontendUrl } from '../utils/url.utils';

const form = {
  company: {
    bankAccountNumber: 'FI81 4975 4587 0004 02',
    firstName: 'Malla',
    lastName: 'Jout-Sen',
    phone: '040 123 4567',
    email: 'yjdh-helsinkilisa@example.net',
    coOperationNegotiationsDescription: 'Aenean fringilla lorem tellus',
  },
  employee: {
    firstName: 'Cool',
    lastName: 'Kanerva',
    ssn: '211081-2043',
    monthlyPay: '1111',
    vacationMoney: '222',
    otherExpenses: '333',
    jobTitle: 'Some-asiantuntija',
    workingHours: '18',
    collectiveBargainingAgreement: '-',
  },
  deminimis: {
    granter: 'Hyvän tekijät Inc.',
    amount: '3000',
    grantedAt: `3.3.${new Date().getFullYear() - 1}`,
  },
};

const url = getFrontendUrl(`/`);

const uploadFileAttachment = async (
  t: TestController,
  selector: string,
  filename = 'sample2.pdf'
) => {
  await t.scrollIntoView(Selector(selector).parent(), { offsetY: -200 });
  await t.setFilesToUpload(selector, filename);
  await t.wait(100);
};

const clearAndFill = async (
  t: TestController,
  selector: string,
  value: string
) => {
  await t.selectText(selector);
  await t.pressKey('delete');
  await t.typeText(selector, value ?? '');
};

fixture('New application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Fill form and submit', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // Open already created form in index page
  const applicationLink = Selector('td')
    .withText('Ruu Rättisitikka')
    .sibling('td')
    .nth(0)
    .find('a');
  await t.click(applicationLink);

  // Start handling the application
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

  await uploadFileAttachment(t, '#upload_attachment_employment_contract');

  /**
   * Click through all applicant terms.
   * Assume terms are loaded from fixture default_terms.json using LOAD_DEFAULT_TERMS=1
   */
  await t.click(Selector('[name="application_consent_0"]'));
  await t.click(Selector('[name="application_consent_1"]'));
  await t.click(Selector('[name="application_consent_2"]'));
  await t.click(Selector('[name="application_consent_3"]'));

  // Validate form and submit
  const nextButton = Selector(buttonSelector).withText(
    fi.applications.actions.save
  );
  await t.click(nextButton);

  const submitButton = Selector(buttonSelector).withText(
    fi.review.actions.handlingPanel
  );
  await t.expect(submitButton.visible).ok();
});
