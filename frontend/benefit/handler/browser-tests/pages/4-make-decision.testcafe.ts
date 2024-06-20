import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { addMonths, format } from 'date-fns';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { EDIT_FORM_DATA as form } from '../constants/forms';
import handlerUser from '../utils/handlerUser';
import { clearAndFill } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('Review edited application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Handler makes a favorable decision', async (t: TestController) => {
  const applicationLink = Selector('td')
    .withText(`${form.employee.firstName} ${form.employee.lastName}`)
    .sibling('td')
    .nth(0)
    .find('a');

  await t.expect(applicationLink.visible).ok();
  await t.click(applicationLink);

  // Click though the calculations
  await t
    .expect(Selector('main').withText(fi.calculators.salary.header).exists)
    .ok();
  const startDate = new Date();
  const endDate = addMonths(startDate, 1);

  // Select state aid max percentage
  await t.click(Selector('#stateAidMaxPercentage-toggle-button'));
  await t.click(Selector('#stateAidMaxPercentage-menu li:first-child'));

  // Fill in the dates
  await clearAndFill(t, '#startDate', format(startDate, DATE_FORMATS.UI_DATE));
  await clearAndFill(t, '#endDate', format(endDate, DATE_FORMATS.UI_DATE));

  // Click "Calculate" button
  await t.click(
    Selector('button').withText(fi.calculators.employment.calculate)
  );

  // Expect a "receipt" of calculation
  await t
    .expect(
      Selector('[data-testid="calculation-results-total"]').withText(
        'Yhteensä ajanjaksolta'
      ).exists
    )
    .ok();

  // Click "accepted" radio
  await t.click(Selector('label').withText(fi.review.fields.support));

  // Click "Make decision" button
  await t.click(Selector('button').withText(fi.review.actions.done));

  // Click final submit inside modal prompt
  await t.click(Selector('[data-testid="submit"]'));

  // Wait for the successs notification to appear
  await t
    .expect(Selector('h1').withText(fi.notifications.accepted.title).exists)
    .ok();
});

test('Handler processes favorable decision to Ahjo / Talpa', async (t: TestController) => {
  // Select all rows and add to batch
  await t.click(
    Selector('li').withText(fi.applications.list.headings.accepted)
  );
  await t.click(Selector('button').withText('Valitse kaikki rivit'));
  await t.click(
    Selector('button').withText(fi.applications.list.actions.addToBatch)
  );

  // Navigate to batches
  await t.click(Selector('a').withText(fi.header.navigation.batches));

  // Visit the completed tab and read the current number of listed applications
  await t.click(Selector('li').withText(fi.batches.tabs.completion));
  await t
    .expect(Selector('h2').withText(fi.batches.tabs.completion).exists)
    .ok();
  const currentCompletedBatchesCount = await Selector('h2')
    .withText(fi.batches.tabs.completion)
    .textContent.then((text) => text.match(/\((\d+)\)/)?.[1]);

  // Return to pending tab and click "Mark as ready for Ahjo" button
  await t.click(Selector('li').withText(fi.batches.tabs.pending));
  await t.click(
    Selector('button').withText(fi.batches.actions.markAsReadyForAhjo)
  );

  // Confirm the action
  await t
    .expect(
      Selector('[role="heading"]').withText(
        fi.batches.notifications.statusChange.exported_ahjo_report.heading
      ).exists
    )
    .ok();

  // Send to nexdt step
  await t.click(
    Selector('button:not([disabled])').withText(
      fi.batches.actions.markAsRegisteredToAhjo
    )
  );

  // Click the submit button on modal prompt
  await t.click(Selector('button').withText(fi.utility.confirm));
  await t.click(Selector('li').withText(fi.batches.tabs.inspection));

  // Type in the inspection / P2P details
  await t.typeText(Selector('[name="decision_maker_name"]'), 'Hissun kissun');
  await t.typeText(Selector('[name="decision_maker_title"]'), 'Vaapulavissun');
  await t.typeText(Selector('[name="section_of_the_law"]'), '1234');
  await t.typeText(
    Selector('[name="expert_inspector_name"]'),
    'Entten Tentten'
  );
  await t.typeText(
    Selector('[name="expert_inspector_title"]'),
    'Teelikamentten'
  );
  await t.typeText(Selector('[name="p2p_checker_name"]'), 'Eelin Keelin');

  // Click the "Mark as ready for Talpa" button
  await t.click(Selector('button').withText(fi.batches.actions.markToTalpa));
  await t.click(Selector('button').withText(fi.utility.confirm));

  // See if the last tab is populated with the batch
  await t.click(Selector('li').withText(fi.batches.tabs.completion));
  await t.wait(1000);

  await t
    .expect(
      Selector('h2').withText(`(${Number(currentCompletedBatchesCount) + 1})`)
        .exists
    )
    .ok();
});
