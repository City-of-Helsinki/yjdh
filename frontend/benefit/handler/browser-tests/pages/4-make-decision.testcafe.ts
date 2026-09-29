import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DATE_FORMATS } from '@frontend/shared/src/utils/date.utils';
import { addMonths, format } from 'date-fns';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import { EDIT_FORM_DATA as form } from '../constants/forms';
import { getApplicationLinkByEmployeeName } from '../utils/application';
import handlerUser from '../utils/handlerUser';
import { clearAndFill } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

const getBatchTab = (label: string): Selector => Selector('li').withText(label);

const getVisibleBatchPanel = (label: string): Selector =>
  Selector('[role="tabpanel"]').filterVisible().withText(label);

const getBatchHeading = (label: string): Selector =>
  getVisibleBatchPanel(label).find('h2').withText(label);

const getBatchApplicationsList = (label: string): Selector =>
  getVisibleBatchPanel(label).find('[data-testid="batch-application-list"]');

const getExpandedBatchBody = (index = 0): Selector =>
  Selector('[data-testid="batch-table-body"]').filterVisible().nth(index);

const getBatchExpandButton = (index = 0): Selector =>
  Selector('[data-testid="toggle-batch-applications"]')
    .filterVisible()
    .nth(index);

const getInspectionField = (batchBody: Selector, name: string): Selector =>
  batchBody.find(`[name="${name}"]`);

fixture('Review edited application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUser);
    await t.navigateTo('/');
  });

test('Handler makes a favorable decision', async (t: TestController) => {
  const applicationLink = getApplicationLinkByEmployeeName(
    `${form.employee.firstName} ${form.employee.lastName}`
  );

  await t.expect(applicationLink.visible).ok();
  await t.click(applicationLink);

  // Click though the calculations
  await t
    .expect(Selector('main').withText(fi.calculators.salary.header).exists)
    .ok();
  const startDate = new Date();
  const endDate = addMonths(startDate, 1);

  // Select state aid max percentage
  await t.click(Selector('#stateAidMaxPercentage'));
  await t.click(Selector('[role="option"]').filterVisible().nth(0));

  // Fill in the dates
  await clearAndFill(t, '#startDate', format(startDate, DATE_FORMATS.UI_DATE));
  await clearAndFill(t, '#endDate', format(endDate, DATE_FORMATS.UI_DATE));

  // Click "Calculate" button
  await t.click(
    Selector('button').withText(fi.calculators.employment.calculate)
  );

  // Expect a "receipt" of calculation
  await t
    .expect(Selector('main').withText(fi.calculators.result.header2).exists)
    .ok({ timeout: 10_000 });

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

  // Visit the completed tab and read the current number of listed batches
  await t.click(getBatchTab(fi.batches.tabs.completion));
  const completionHeading = getBatchHeading(fi.batches.tabs.completion);
  const completionList = getBatchApplicationsList(fi.batches.tabs.completion);
  await t.expect(completionList.exists).ok({ timeout: 10_000 });
  await t.expect(completionHeading.textContent).match(/\(\d+\)/, {
    timeout: 10_000,
  });
  const currentCompletedBatchesCount = Number(
    await completionHeading.textContent.then(
      (text) => /\((\d+)\)/.exec(text)?.[1]
    )
  );

  // Return to pending tab and click "Mark as ready for Ahjo" button
  await t.click(getBatchTab(fi.batches.tabs.pending));
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
  await t.click(getBatchTab(fi.batches.tabs.inspection));

  // Inspection batches are collapsed by default; expand the newest batch.
  await t.click(getBatchExpandButton());
  const inspectionBatchBody = getExpandedBatchBody();
  await t
    .expect(
      getInspectionField(inspectionBatchBody, 'decision_maker_name').visible
    )
    .ok({ timeout: 10_000 });

  // Type in the inspection / P2P details
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'decision_maker_name'),
    'Hissun kissun'
  );
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'decision_maker_title'),
    'Vaapulavissun'
  );
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'section_of_the_law'),
    '1234'
  );
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'expert_inspector_name'),
    'Entten Tentten'
  );
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'expert_inspector_title'),
    'Teelikamentten'
  );
  await t.typeText(
    getInspectionField(inspectionBatchBody, 'p2p_checker_name'),
    'Eelin Keelin'
  );

  // Click the "Mark as ready for Talpa" button
  await t.click(Selector('button').withText(fi.batches.actions.markToTalpa));
  await t.click(Selector('button').withText(fi.utility.confirm));

  await t
    .expect(
      Selector('[role="heading"]').withText(
        fi.batches.notifications.statusChange.accepted.heading
      ).exists
    )
    .ok({ timeout: 10_000 });

  // See if the last tab is populated with the batch
  await t.click(getBatchTab(fi.batches.tabs.completion));

  await t
    .expect(completionHeading.textContent)
    .contains(`(${currentCompletedBatchesCount + 1})`, {
      timeout: 10_000,
    });
});
