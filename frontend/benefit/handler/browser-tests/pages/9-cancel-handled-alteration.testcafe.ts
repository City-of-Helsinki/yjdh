// The eslint rule erroneously assumes that Selector.find() works like Array.find().
/* eslint-disable unicorn/no-array-callback-reference */
import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';

import { navigateToAlterationTestApplication } from '../utils/alteration';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';
import fi from '../../public/locales/fi/common.json';
import { Selector } from 'testcafe';

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

test('Handler cancels an already handled alteration', async (t: TestController) => {
  await navigateToAlterationTestApplication(t);

  // Find the alteration created in the earlier handling test
  const item = alterationList.find('div').withText(/keskeytynyt 24\.6\.2024/);
  await t
    .expect(
      Selector('h2').withText(fi.applications.decision.headings.mainHeading)
        .visible
    )
    .ok();

  // Open the alteration accordion item and cancel the alteration
  await t.click(item.find(accordionItemTitle));
  await t.click(
    Selector('button').withText(
      fi.applications.decision.alterationList.item.actions.cancel
    )
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
  await t.expect(item.exists).ok();
  await t
    .expect(
      item
        .find('[data-testid="alteration-state-tag"]')
        .withText(fi.applications.decision.alterationList.item.state.cancelled)
        .exists
    )
    .ok();
});
/* eslint-enable unicorn/no-array-callback-reference */
