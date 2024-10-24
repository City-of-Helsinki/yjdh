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

fixture('Basic alteration handled by handler')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await t.navigateTo('/');
  });

const alterationList = Selector('div[data-testid="alteration-list"]');
const submitButton = Selector('button').withText(
  fi.applications.alterations.new.actions.submit
);
const calculateButton = Selector('button').withText(
  fi.applications.alterations.handling.calculation.actions.calculate
);
const calculationResult = Selector('div[data-testid="calculationResult"]');
const recoveryStartDate = Selector('#recovery-start-date');
const recoveryEndDate = Selector('#recovery-end-date');
const accordionItemTitle = 'div[role="heading"]';
const recoveryStartDateError = '#recovery-start-date-error';
const recoveryEndDateError = '#recovery-end-date-error';
const csvButton = Selector(
  'button[data-testid="button-download-alteration-csv"]'
);
const handleButton = Selector('button').withText(
  fi.applications.alterations.handling.actions.handle
);

const getCurrencyString = (value: number, decimals = 2): string =>
  value.toLocaleString('fi-FI', {
    minimumFractionDigits: decimals,
    style: 'currency',
    currency: 'EUR',
  });

const expectHandleButtonDisabled = async (
  t: TestController,
  test = true
): Promise<void> => {
  const attributes = await handleButton.attributes;
  await t.expect((attributes.disabled !== undefined) === test).ok();
};

test('Handler creates another alteration and tries to handle it with errors', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  // Create the new alteration
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

  await t.click(Selector('[for=alteration-alteration-type-suspension]'));
  await t.typeText('#alteration-end-date', suspensionForm.endDate);
  await t.typeText('#alteration-resume-date', suspensionForm.resumeDate);

  await t.click(Selector('[for=alteration-use-einvoice-yes]'));
  await t.typeText('#alteration-reason', suspensionForm.reason);
  await clearAndFill(
    t,
    '#alteration-contact-person-name',
    suspensionForm.contactPersonName
  );
  await t.typeText(
    '#alteration-einvoice-provider-name',
    suspensionForm.einvoiceProviderName
  );
  await t.typeText(
    '#alteration-einvoice-provider-identifier',
    suspensionForm.einvoiceProviderIdentifier
  );
  await t.typeText(
    '#alteration-einvoice-address',
    suspensionForm.einvoiceAddress
  );

  await t.click(submitButton);
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();

  // Find the list item and begin handling the alteration
  const item = alterationList.find('div').withText(/keskeytynyt 24\.6\.2024/);
  await t.click(item.find(accordionItemTitle));
  await t.click(
    item
      .find('button')
      .withText(
        fi.applications.decision.alterationList.item.actions.beginHandling
      )
  );

  // Verify that validation fails
  await expectHandleButtonDisabled(t);
  await t.click(csvButton);
  await t.click(handleButton);

  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.error.calculationOutOfDate
      ).exists
    )
    .ok();

  await t
    .expect(
      Selector('#recovery-justification-error').withText(
        fi.form.validation.required
      ).exists
    )
    .ok();

  // Test that dates are also required
  await t.click(recoveryStartDate);
  await t.selectText(recoveryStartDate);
  await t.pressKey('delete');
  await t.click(recoveryEndDate);
  await t.selectText(recoveryEndDate);
  await t.pressKey('delete');
  await t
    .expect(
      Selector(recoveryStartDateError).withText(fi.form.validation.required)
        .exists
    )
    .ok();
  await t
    .expect(
      Selector(recoveryEndDateError).withText(fi.form.validation.required)
        .exists
    )
    .ok();

  // Test dates outside the subsidy period
  await clearAndFill(t, recoveryStartDate, '24.5.2024');
  await t
    .expect(
      Selector(recoveryStartDateError).withText(
        fi.form.validation.date.min.replace('{{min}}', '17.6.2024')
      ).exists
    )
    .ok();
  await clearAndFill(t, recoveryStartDate, '24.12.2024');
  await t
    .expect(
      Selector(recoveryStartDateError).withText(
        fi.form.validation.date.max.replace('{{max}}', '17.10.2024')
      ).exists
    )
    .ok();
  await t.click(recoveryStartDate);
  await t.selectText(recoveryStartDate);
  await t.pressKey('delete');

  await clearAndFill(t, recoveryEndDate, '24.5.2024');
  await t
    .expect(
      Selector(recoveryEndDateError).withText(
        fi.form.validation.date.min.replace('{{min}}', '17.6.2024')
      ).exists
    )
    .ok();
  await clearAndFill(t, recoveryEndDate, '24.12.2024');
  await t
    .expect(
      Selector(recoveryEndDateError).withText(
        fi.form.validation.date.max.replace('{{max}}', '17.10.2024')
      ).exists
    )
    .ok();

  // Test recovery end date before start date
  await clearAndFill(t, recoveryStartDate, '25.6.2024');
  await clearAndFill(t, recoveryEndDate, '20.6.2024');
  await t
    .expect(
      Selector(recoveryEndDateError).withText(
        fi.form.validation.date.min.replace('{{min}}', '25.6.2024')
      ).exists
    )
    .ok();

  // Test that recovery during a period where the calculation is zero is not allowed
  await clearAndFill(t, recoveryEndDate, '29.6.2024');
  await t.click(calculateButton);
  const resultText = await calculationResult.textContent;
  await t.expect(resultText.includes(getCurrencyString(0, 0))).ok();
  await t.click(Selector('[for="is-recoverable-yes"]'));
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.fields.isRecoverable.emptyRecovery
      ).exists
    )
    .ok();
});

test('Handler handles the alteration from the last test properly', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  let resultText = '';

  // Find the list item and begin handling the alteration
  const item = alterationList.find('div').withText(/keskeytynyt 24\.6\.2024/);
  await t.click(item.find(accordionItemTitle));
  await t.click(
    item
      .find('button')
      .withText(
        fi.applications.decision.alterationList.item.actions.beginHandling
      )
  );

  await t
    .expect(
      Selector('h1').withText(
        fi.applications.alterations.handling.headings.pageHeading
      ).visible
    )
    .ok();

  // Check that the initial calculator dates are correctly set to all dates between
  // the last day of work and resume date, non-inclusive
  const prefilledStartDate = await recoveryStartDate.value;
  const prefilledEndDate = await recoveryEndDate.value;
  await t.expect(prefilledStartDate === '25.6.2024').ok();
  await t.expect(prefilledEndDate === '11.8.2024').ok();

  // Click on the calculation button and verify that a calculation was made
  await t.click(calculateButton);
  await t.expect(calculationResult.exists).ok();

  // Set the date range to rows two through four exactly
  await clearAndFill(t, recoveryStartDate, '25.6.2024');
  await clearAndFill(t, recoveryEndDate, '22.7.2024');

  // Verify that the out-of-date calculation alert is visible
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.calculation.outOfDate.heading
      ).exists
    )
    .ok();

  // Recalculate and verify that the calculation matches the three rows' subtotals (€0, €19, €43)
  await t.click(calculateButton);
  await t.expect(calculationResult.exists).ok();
  resultText = await calculationResult.textContent;
  await t.expect(resultText.includes(getCurrencyString(62, 0))).ok();

  // Verify that the out-of-date calculation alert is no longer visible
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.calculation.outOfDate.heading
      ).exists
    )
    .notOk();

  // Set the date range to the last day of the last row
  await clearAndFill(t, recoveryStartDate, '24.6.2024');
  await clearAndFill(t, recoveryEndDate, '24.6.2024');

  // Recalculate and verify that the calculation is not zero
  await t.click(calculateButton);
  resultText = await calculationResult.textContent;
  const expectedAmount = 68 * (0.03 / 0.27);
  await t
    .expect(resultText.includes(getCurrencyString(expectedAmount, 0)))
    .ok();

  // Select manual calculation mode
  await t.click(
    Selector('span').withExactText(
      fi.applications.alterations.handling.calculation.tabs.manual
    )
  );
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.calculation.outOfDate.heading
      ).exists
    )
    .ok();

  // Set manual values and recalculate
  await clearAndFill(t, recoveryStartDate, '25.6.2024');
  await clearAndFill(t, recoveryEndDate, '9.8.2024');
  await clearAndFill(t, '#manual-recovery-amount', '10');

  // Verify that the calculation is now the manually set amount
  // and not the calculated amount (€179.50)
  await t.click(calculateButton);
  resultText = await calculationResult.textContent;
  await t.expect(resultText.includes(getCurrencyString(10, 0))).ok();

  // Verify that a warning is not shown when the alteration with a small calculated recovery sum
  // is set to not be recoverable
  await t.click(Selector('[for="is-recoverable-no"]'));
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.fields.isRecoverable.limitWarning
          .heading
      ).exists
    )
    .notOk();

  // Set a more appropriate manual calculated amount
  await clearAndFill(t, '#manual-recovery-amount', '180');
  await t.click(calculateButton);

  // Verify that the warning is now shown, then select that recovery is enabled
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.fields.isRecoverable.limitWarning
          .heading
      ).exists
    )
    .ok();
  await t.click(Selector('[for="is-recoverable-yes"]'));
  await t
    .expect(
      Selector('div').withText(
        fi.applications.alterations.handling.fields.isRecoverable.limitWarning
          .heading
      ).exists
    )
    .notOk();

  // Fill in the justification
  await t.typeText('#recovery-justification', 'Selvä kuin pläkki');

  // Submit the handling form
  await t.click(csvButton);
  await t.click(handleButton);

  const modal = Selector('div[role="dialog"]').withText(
    fi.applications.alterations.handling.confirmation.recoverable.title
  );
  await t.click(modal.find('button').withText(fi.utility.confirm));

  // Verify that the alteration is now handled
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();
  await t.click(item.find(accordionItemTitle));
  await t
    .expect(
      item
        .find('[data-testid="alteration-state-tag"]')
        .withText(fi.applications.decision.alterationList.item.state.handled)
        .exists
    )
    .ok();
  await t
    .expect(item.find('dl dd').withText(getCurrencyString(180, 0)).exists)
    .ok();
});

/* eslint-enable unicorn/no-array-callback-reference */
