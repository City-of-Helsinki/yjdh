import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { format } from 'date-fns';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { NEW_FORM_DATA as form } from '../constants/forms';
import MainIngress from '../page-model/MainIngress';
import handlerUser from '../utils/handlerUser';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

const uploadFileAttachment = async (
  t: TestController,
  selector: string,
  filename = 'sample.pdf'
) => {
  await t.scrollIntoView(Selector(selector).parent(), { offsetY: -200 });
  await t.setFilesToUpload(selector, filename);
  await t.wait(100);
};

fixture('Create new application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Fill form and submit', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // Start filling form manually
  await t.click('[data-testid="new-application-button"]');

  // Organization info
  const searchCompanyInput = Selector(
    '[data-testid="company-search-input"]'
  ).find('input');
  await t.typeText(searchCompanyInput, form.company.id).pressKey('enter');

  // Company info
  await t.typeText('#companyBankAccountNumber', form.company.bankAccountNumber);
  await t.typeText('#companyContactPersonFirstName', form.company.firstName);
  await t.typeText('#companyContactPersonLastName', form.company.lastName);
  await t.typeText('#companyContactPersonPhoneNumber', form.company.phone);
  await t.typeText('#companyContactPersonEmail', form.company.email);

  // De minimis aid
  await t.click('[for="deMinimisAidTrue"]');
  await t.typeText('#granter', form.deminimis.granter);
  await t.typeText('#amount', form.deminimis.amount);
  await t.typeText('#grantedAt', form.deminimis.grantedAt);
  const addButton = Selector('main button span')
    .withText(fi.applications.sections.deMinimisAidsAdd)
    .parent();
  await t.click(addButton);

  await t.click('[for="coOperationNegotiationsTrue"]');
  await t.typeText(
    '#coOperationNegotiationsDescription',
    form.company.coOperationNegotiationsDescription
  );

  // Employee info
  await t.typeText('[name="employee.firstName"]', form.employee.firstName);
  await t.typeText('[name="employee.lastName"]', form.employee.lastName);
  await t.typeText('[name="employee.socialSecurityNumber"]', form.employee.ssn);
  await t.click('[for="employee.isLivingInHelsinki"]');

  await t.typeText('[name="employee.jobTitle"]', form.employee.jobTitle);
  await t.typeText(
    '[name="employee.workingHours"]',
    form.employee.workingHours
  );
  await t.typeText(
    '[name="employee.collectiveBargainingAgreement"]',
    form.employee.collectiveBargainingAgreement
  );

  await t.typeText('[name="employee.monthlyPay"]', form.employee.monthlyPay);
  await t.typeText(
    '[name="employee.vacationMoney"]',
    form.employee.vacationMoney
  );
  await t.typeText(
    '[name="employee.otherExpenses"]',
    form.employee.otherExpenses
  );

  await t.click('[for="paySubsidyGranted.granted"]');
  await t.click('[for="apprenticeshipProgramTrue"]');

  await t.typeText(
    '[name="startDate"]',
    format(new Date(), DATE_FORMATS.UI_DATE)
  );

  await uploadFileAttachment(t, '#upload_attachment_full_application');
  await t.wait(1000);
  await uploadFileAttachment(t, '#upload_attachment_employment_contract');
  await t.wait(1000);
  await uploadFileAttachment(t, '#upload_attachment_education_contract');
  await t.wait(1000);
  await uploadFileAttachment(t, '#upload_attachment_pay_subsidy_decision');
  await t.wait(1000);

  /**
   * Click through all applicant terms.
   * Assume terms are loaded from fixture default_terms.json using LOAD_DEFAULT_TERMS=1
   */
  await t.click(Selector('[name="application_consent_0"]'));
  await t.click(Selector('[name="application_consent_1"]'));
  await t.click(Selector('[name="application_consent_2"]'));
  await t.click(Selector('[name="application_consent_3"]'));

  // Validate form and submit
  const buttonSelector = 'main button';
  const nextButton = Selector(buttonSelector).withText(
    fi.applications.actions.continue
  );
  await t.click(nextButton);

  const submitButton = Selector(buttonSelector).withText(
    fi.applications.actions.send
  );
  await t.expect(submitButton.visible).ok();
  await t.click(submitButton);

  // Form submitted, single application view shown
  const handleButton = Selector(buttonSelector).withText(
    fi.review.actions.handle
  );
  await t.expect(handleButton.visible).ok();
});
