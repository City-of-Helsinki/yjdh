// The eslint rule erroneously assumes that Selector.find() works like Array.find().
/* eslint-disable unicorn/no-array-callback-reference */
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { NEW_SUSPENSION_ALTERATION_DATA as suspensionForm } from '../constants/forms';
import { navigateToAlterationTestApplication } from '../utils/alteration';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { clearAndFill } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('Error handling during new alteration creation')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await t.navigateTo('/');
  });

const submitButton = Selector('button').withText(
  fi.applications.alterations.new.actions.submit
);

const expectSubmitButtonDisabled = async (
  t: TestController,
  test = true
): Promise<void> => {
  const attributes = await submitButton.attributes;
  await t.expect((attributes.disabled !== undefined) === test).ok();
};

test('Handler attempts to create a new alteration with incorrect inputs', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  const alterationEndDateError = '#alteration-end-date-error';
  const alterationResumeDateError = '#alteration-resume-date-error';
  const alterationEndDate = '#alteration-end-date';
  const alterationResumeDate = '#alteration-resume-date';
  const alterationContactPersonName = '#alteration-contact-person-name';

  await t.click(
    Selector('button').withText(
      fi.applications.decision.actions.reportAlteration
    )
  );
  await t
    .expect(
      Selector('h1').withText(fi.applications.alterations.new.title).visible
    )
    .ok();

  // Attempt to submit the form without changing any fields, verify that validation fails to missing alteration type
  await t.click(submitButton);
  await expectSubmitButtonDisabled(t);
  await t
    .expect(
      Selector('fieldset#alteration-alteration-type')
        .find('div')
        .withText(fi.form.validation.required).exists
    )
    .ok();

  // Fill in the type, verify that validation fails to missing alteration date range
  await t.click(Selector('[for=alteration-alteration-type-suspension]'));
  await expectSubmitButtonDisabled(t);
  await t
    .expect(
      Selector(alterationEndDateError).withText(fi.form.validation.required)
        .exists
    )
    .ok();
  await t
    .expect(
      Selector(alterationResumeDateError).withText(fi.form.validation.required)
        .exists
    )
    .ok();

  // Fill in a last date of work that's before the start of subsidy, verify that validation fails
  await t.typeText(alterationEndDate, '11.6.2024');
  await t
    .expect(
      Selector(alterationEndDateError).withText(
        fi.form.validation.date.min.replace('{{min}}', '17.6.2024')
      ).exists
    )
    .ok();

  // Fill in a last date of work that's after the end of subsidy, verify that validation fails
  await clearAndFill(t, alterationEndDate, '12.12.2024');
  await t
    .expect(
      Selector(alterationEndDateError).withText(
        fi.form.validation.date.max.replace('{{max}}', '17.10.2024')
      ).exists
    )
    .ok();

  // Set a coherent last date of work, set the resume date to before that
  await clearAndFill(t, alterationEndDate, '13.9.2024');
  await t.typeText(alterationResumeDate, '9.9.2024');
  await t
    .expect(
      Selector(alterationResumeDateError).withText(
        fi.applications.alterations.new.validation.resumeDateBeforeEndDate
      ).exists
    )
    .ok();

  // Fill in a last date of work during the existing handled alteration created in previous test
  // Dates are disabled in the date picker, but in the validation this is currently only checked server-side
  // await t.typeText('#alteration-end-date', '10.7.2024');
  // await t.expect(Selector('#alteration-end-date-error').withText(fi.applications.alterations.new.validation.existingAlteration).exists).ok();

  // Verify that resume dates outside the subsidy period do not pass validation as well
  await t.click(alterationEndDate);
  await t.selectText(alterationEndDate);
  await t.pressKey('delete');
  await clearAndFill(t, alterationResumeDate, '11.6.2024');
  await t
    .expect(
      Selector(alterationResumeDateError).withText(
        fi.form.validation.date.min.replace('{{min}}', '17.6.2024')
      ).exists
    )
    .ok();
  await clearAndFill(t, alterationResumeDate, '12.12.2024');
  await t
    .expect(
      Selector(alterationResumeDateError).withText(
        fi.form.validation.date.max.replace('{{max}}', '17.10.2024')
      ).exists
    )
    .ok();

  // Set dates to valid, verify that form validation passes for now
  await clearAndFill(t, alterationEndDate, '13.9.2024');
  await clearAndFill(t, alterationResumeDate, '19.9.2024');
  await expectSubmitButtonDisabled(t, false);

  // Verify that the contact person name field is required
  await t.click(alterationContactPersonName);
  await t.selectText(alterationContactPersonName);
  await t.pressKey('delete');
  await expectSubmitButtonDisabled(t);
  await t
    .expect(
      Selector('#alteration-contact-person-name-error').withText(
        fi.form.validation.required
      ).exists
    )
    .ok();
  await clearAndFill(t, alterationContactPersonName, 'Testi Hakija');

  // Verify that all einvoice fields are required if the billing is set to use einvoicing
  await t.click(Selector('[for=alteration-use-einvoice-yes]'));
  await expectSubmitButtonDisabled(t);
  await t
    .expect(
      Selector('#alteration-einvoice-provider-name-error').withText(
        fi.form.validation.required
      ).exists
    )
    .ok();
  await t
    .expect(
      Selector('#alteration-einvoice-provider-identifier-error').withText(
        fi.form.validation.required
      ).exists
    )
    .ok();
  await t
    .expect(
      Selector('#alteration-einvoice-address-error').withText(
        fi.form.validation.required
      ).exists
    )
    .ok();

  await t.typeText(
    '#alteration-einvoice-provider-name',
    suspensionForm.einvoiceProviderName
  );
  await expectSubmitButtonDisabled(t);
  await t.typeText(
    '#alteration-einvoice-provider-identifier',
    suspensionForm.einvoiceProviderIdentifier
  );
  await expectSubmitButtonDisabled(t);
  await t.typeText(
    '#alteration-einvoice-address',
    suspensionForm.einvoiceAddress
  );
  await expectSubmitButtonDisabled(t, false);
});
/* eslint-enable unicorn/no-array-callback-reference */
