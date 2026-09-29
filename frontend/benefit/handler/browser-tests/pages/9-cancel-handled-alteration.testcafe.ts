// The eslint rule erroneously assumes that Selector.find() works like Array.find().
/* eslint-disable unicorn/no-array-callback-reference */
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { navigateToAlterationTestApplication } from '../utils/alteration';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('Cancelled alteration handling')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await t.navigateTo('/');
  });

const alterationList = Selector('div[data-testid="alteration-list"]');
const accordionItemTitle = 'div[role="heading"]';
const suspensionCards = alterationList
  .find('[data-testid="alteration-item"]')
  .withText(/keskeytynyt 24\.6\.2024/);
const handledSuspension = suspensionCards.withText(
  fi.applications.decision.alterationList.item.state.handled
);
const cancelledSuspensions = suspensionCards.withText(
  fi.applications.decision.alterationList.item.state.cancelled
);

test('Handler cancels an already handled alteration', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();

  // Target an alteration that is still handled; older cancelled cards may exist.
  const handledCount = await handledSuspension.count;
  const cancelledCount = await cancelledSuspensions.count;
  await t.expect(handledCount).gt(0);
  const item = handledSuspension.nth(0);
  await t.click(item.find(accordionItemTitle));
  await t.click(
    item
      .find('button')
      .withText(fi.applications.decision.alterationList.item.actions.cancel)
  );
  const modal = Selector('div[role="dialog"]').withText(
    fi.applications.decision.alterationList.cancelModal.body
  );
  await t.click(
    modal
      .find('button')
      .withText(
        fi.applications.decision.alterationList.cancelModal.setCancelled
      )
  );

  // Wait for the notification to appear
  const notification = Selector('div[role="alert"]').withText(
    fi.notifications.alterationCancelled.label
  );
  await t.click(notification.find('button'));

  // Verify that the alteration is still listed, but in a cancelled state
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();
  await t
    .expect(handledSuspension.count)
    .eql(handledCount - 1, { timeout: 10_000 });
  await t
    .expect(cancelledSuspensions.count)
    .eql(cancelledCount + 1, { timeout: 10_000 });
});
/* eslint-enable unicorn/no-array-callback-reference */
