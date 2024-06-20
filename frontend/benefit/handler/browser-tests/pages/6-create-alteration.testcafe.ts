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

test('Handler creates a new alteration', async (t: TestController) => {
  // Note: on local development, any existing alterations should be deleted before
  // running test files six through nine:
  //   delete from applications_applicationalteration where application_id = '3544c528-73cc-4a08-8240-09f713a14990';
  // Any test assertions regarding the alteration list fail if old cancelled alterations
  // from previous test runs still linger in the UI, and the test controller is unable
  // to clear them itself before the tests.

  await navigateToAlterationTestApplication(t);

  // Find the decision box
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();

  // Find the alteration list, confirm it's empty
  await t.expect(alterationList.childNodeCount).eql(0);

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
    terminationForm.contactPersonName
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
  await t.expect(alterationList.childNodeCount).eql(1);

  const item = alterationList.child(0);
  await t
    .expect(
      item.find(accordionItemTitle).withText(/päättynyt 23\.8\.2024/).exists
    )
    .ok();
  await t
    .expect(
      item
        .find('div')
        .withText(fi.applications.decision.alterationList.item.state.received)
        .exists
    )
    .ok();
  await t.click(item.find(accordionItemTitle));
  await t
    .expect(
      item.find('dl dd').withText(terminationForm.contactPersonName).exists
    )
    .ok();
});

test('Handler deletes the pending alteration', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  // Find the alteration created in the previous test
  await t.expect(alterationList.childNodeCount).eql(1);
  const item = alterationList.child(0);

  // Open the list item and click the delete button
  await t.click(item.find(accordionItemTitle));
  await t.click(
    item
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

  // Verify that the alteration was deleted and no longer shown in the list in any form
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();
  await t.expect(alterationList.childNodeCount).eql(0);
});

/* eslint-enable unicorn/no-array-callback-reference */
