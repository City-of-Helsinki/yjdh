// The eslint rule erroneously assumes that Selector.find() works like Array.find().
/* eslint-disable unicorn/no-array-callback-reference */
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { NEW_TERMINATION_ALTERATION_DATA as terminationForm } from '../constants/forms';
import { navigateToAlterationTestApplication } from '../utils/alteration';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { clearAndFill } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('New alteration reported by handler')
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
const accordionItemTitle = 'div[role="heading"]';
const testContactPersonName = `${
  terminationForm.contactPersonName
} ${Date.now()}`;
const testAlteration = alterationList
  .find('[data-testid="alteration-item"]')
  .withText(/päättynyt 23\.8\.2024/)
  .withText(fi.applications.decision.alterationList.item.state.received);

const removeReceivedAlterations = async (t: TestController): Promise<void> => {
  const receivedAlterations = alterationList
    .find('[data-testid="alteration-item"]')
    .withText(fi.applications.decision.alterationList.item.state.received);
  let remaining = await receivedAlterations.count;

  while (remaining > 0) {
    const alteration = receivedAlterations.nth(0);
    await t.click(alteration.find(accordionItemTitle));
    await t.click(
      alteration
        .find('button')
        .withText(fi.applications.decision.alterationList.item.actions.delete)
    );
    await t
      .expect(
        Selector('div[role="dialog"] h2').withText(
          fi.applications.decision.alterationList.deleteModal.title
        ).visible
      )
      .ok();
    await t.click(
      Selector('div[role="dialog"] button').withText(
        fi.applications.decision.alterationList.deleteModal.delete
      )
    );
    await t
      .expect(receivedAlterations.count)
      .eql(remaining - 1, { timeout: 10_000 });
    remaining -= 1;
  }
};

test('Handler creates a new alteration', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  // Find the decision box
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();

  // A previous interrupted run may leave a received alteration, which disables
  // the create button. Remove those records before this test starts.
  await removeReceivedAlterations(t);

  const initialAlterationCount = await alterationList.childNodeCount;

  // Click the new alteration button
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

  // Fill in the data
  await t.click(Selector('[for=alteration-alteration-type-termination]'));
  await t.typeText('#alteration-end-date', terminationForm.endDate);

  await t.click(Selector('[for=alteration-use-einvoice-yes]'));
  await t.typeText('#alteration-reason', terminationForm.reason);
  await clearAndFill(
    t,
    '#alteration-contact-person-name',
    testContactPersonName
  );
  await t.typeText(
    '#alteration-einvoice-provider-name',
    terminationForm.einvoiceProviderName
  );
  await t.typeText(
    '#alteration-einvoice-provider-identifier',
    terminationForm.einvoiceProviderIdentifier
  );
  await t.typeText(
    '#alteration-einvoice-address',
    terminationForm.einvoiceAddress
  );

  // Validate and submit
  await t.click(submitButton);
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();
  await t.expect(alterationList.childNodeCount).eql(initialAlterationCount + 1);

  await t.expect(testAlteration.exists).ok({ timeout: 10_000 });
  await t
    .expect(
      testAlteration.find(accordionItemTitle).withText(/päättynyt 23\.8\.2024/)
        .exists
    )
    .ok();
  await t
    .expect(
      testAlteration
        .find('[data-testid="alteration-state-tag"]')
        .withText(fi.applications.decision.alterationList.item.state.received)
        .exists
    )
    .ok();
  await t.click(testAlteration.find(accordionItemTitle));
  await t
    .expect(testAlteration.find('dl dd').withText(testContactPersonName).exists)
    .ok();
});

test('Handler deletes the pending alteration', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  // Locate this run's alteration by its unique contact name.
  await t.expect(testAlteration.exists).ok({ timeout: 10_000 });
  await t
    .expect(
      testAlteration.find(accordionItemTitle).withText(/päättynyt 23\.8\.2024/)
        .exists
    )
    .ok();

  // Open the list item and click the delete button
  await t.click(testAlteration.find(accordionItemTitle));
  await t
    .expect(testAlteration.find('dl dd').withText(testContactPersonName).exists)
    .ok();
  await t.click(
    testAlteration
      .find('button')
      .withText(fi.applications.decision.alterationList.item.actions.delete)
  );

  // Click the confirm button in the modal
  await t
    .expect(
      Selector('div[role="dialog"] h2').withText(
        fi.applications.decision.alterationList.deleteModal.title
      ).visible
    )
    .ok();
  await t.click(
    Selector('div[role="dialog"] button').withText(
      fi.applications.decision.alterationList.deleteModal.delete
    )
  );

  // Verify that this run's alteration was deleted; older records may remain.
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();
  await t
    .expect(alterationList.find('dl dd').withText(testContactPersonName).exists)
    .notOk();
});

/* eslint-enable unicorn/no-array-callback-reference */
