import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import { getApplicationLinkByEmployeeName } from '../utils/application';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { clearAndFill } from '../utils/input';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);
const aariApplicationLink = getApplicationLinkByEmployeeName('Aari Hömpömpö');

const openAariApplicationIfPending = async (
  t: TestController
): Promise<boolean> => {
  await t.expect(Selector('tbody tr').exists).ok({ timeout: 10_000 });

  if (!(await aariApplicationLink.exists)) {
    await t.click(
      Selector('li').withText(fi.applications.list.headings.accepted)
    );
    await t.expect(aariApplicationLink.visible).ok({ timeout: 10_000 });
    // eslint-disable-next-line no-console
    console.warn(
      'Skipping Ahjo test: Aari Hömpömpö has already advanced to accepted.'
    );
    return false;
  }

  await t.click(aariApplicationLink);
  return true;
};

const getErrorNotification = (message: string): Selector =>
  Selector('.Toastify__toast-body[role="alert"]').withText(message);

fixture('Ahjo decision proposal for application')
  .page(url)
  .clientScripts({
    content: 'window.localStorage.setItem("newAhjoMode", "1");',
  })
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await t.navigateTo('/');
  });

test('Check for handling validation errors', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // The persistent fixture may already be beyond this step from an earlier run.
  if (!(await openAariApplicationIfPending(t))) return;

  // Start handling the application.
  const buttonSelector = 'main button';
  const handleButton = Selector(buttonSelector).withText(fi.utility.next);
  await t.expect(handleButton.visible).ok();

  // Check for empty status
  const missingStatusNotification = getErrorNotification(
    fi.review.decisionProposal.errors.fields.status
  );
  await t.click(handleButton);
  await t.expect(missingStatusNotification.visible).ok();

  // Check for empty log entry
  const missingLogEntryNotification = getErrorNotification(
    fi.review.decisionProposal.errors.fields.logEntry
  );
  await t.click(Selector('label').withText(fi.review.fields.noSupport));
  await t.click(handleButton);
  await t.expect(missingLogEntryNotification.visible).ok();

  // Check for calculation error
  await clearAndFill(t, '#monthlyPay', ' ');
  const calculationErrorNotification = getErrorNotification(
    fi.review.decisionProposal.errors.fields.calculation
  );
  await t.click(handleButton);
  await t.expect(calculationErrorNotification.visible).ok();
});

test('Open form and create a decision proposal', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // The persistent fixture may already be beyond this step from an earlier run.
  if (!(await openAariApplicationIfPending(t))) return;
  // Start handling the application.
  const buttonSelector = 'main button';
  const handleButton = Selector(buttonSelector).withText(fi.utility.next);
  await t.expect(handleButton.visible).ok();

  await t.click(Selector('label').withText(fi.review.fields.support));
  await t.click(
    Selector('label').withText(fi.review.actions.grantedAsDeminimisAidNo)
  );
  await t.click(handleButton);

  const firstSignerRadio = Selector('[id^="radio-signer-"]')
    .filterVisible()
    .nth(0);
  await t.expect(firstSignerRadio.exists).ok();
  const firstSignerRadioId = await firstSignerRadio.getAttribute('id');
  await t.click(Selector(`label[for="${firstSignerRadioId}"]`));
  await t.expect(firstSignerRadio.checked).ok();

  const firstDecisionMakerRadio = Selector('[id^="radio-decision-maker-"]')
    .filterVisible()
    .nth(0);
  await t.expect(firstDecisionMakerRadio.exists).ok();
  const firstDecisionMakerRadioId = await firstDecisionMakerRadio.getAttribute(
    'id'
  );
  await t.click(Selector(`label[for="${firstDecisionMakerRadioId}"]`));

  await t.click(
    Selector('label').withText(
      fi.review.decisionProposal.role.fields.decisionMaker.handler
    )
  );

  const templateSelect = Selector('[role="combobox"]').filterVisible().nth(0);
  await t.expect(templateSelect.exists).ok({ timeout: 10_000 });
  await t.click(templateSelect);

  await t.click(
    Selector('[role="option"]')
      .withText('FI: Myönteisen päätöksen Päätös-osion teksti')
      .filterVisible()
      .nth(0)
  );

  // Has decision text in editor
  await t
    .expect(Selector('[data-testid="decisionText"] .tiptap').child().count)
    .eql(3);

  // Has justification text in editor
  await t
    .expect(Selector('[data-testid="justificationText"] .tiptap').child().count)
    .eql(10);

  await t.click(handleButton);

  await t
    .expect(Selector('[data-testid="decision-text-preview"]').child().count)
    .eql(3);

  await t
    .expect(
      Selector('[data-testid="justification-text-preview"]').child().count
    )
    .eql(10);

  await t.click(Selector(buttonSelector).withText(fi.utility.send));
  await t.click(Selector('button').withText(fi.review.actions.accept));

  await t
    .expect(
      Selector('h1').withText(fi.review.decisionProposal.submitted.title)
        .visible
    )
    .ok();
});
