import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';
import { clearAndFill } from '../utils/input';

const url = getFrontendUrl(`/`);

fixture('Ahjo decision proposal for application')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await t.navigateTo('/');
  });

// eslint-disable-next-line jest/expect-expect
test('Check validation errors', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // Open already created application in index page
  const applicationLink = Selector('td')
    .withText(`Aari Hömpömpö`)
    .sibling('td')
    .nth(0)
    .find('a');
  await t.click(applicationLink);

  // // Start handling the application
  const toastSelector = '.Toastify__toast-body[role="alert"]';
  const buttonSelector = 'main button';
  const handleButton = Selector(buttonSelector).withText(fi.utility.next);
  await t.expect(handleButton.visible).ok();

  // Check for empty status
  let errorNotification = Selector(toastSelector).withText(
    fi.review.decisionProposal.errors.fields.status
  );
  await t.click(handleButton);
  await t.expect(errorNotification.visible).ok();

  // Check for empty log entry
  errorNotification = Selector(toastSelector).withText(
    fi.review.decisionProposal.errors.fields.logEntry
  );
  await t.click(Selector('label').withText(fi.review.fields.noSupport));
  await t.click(handleButton);
  await t.expect(errorNotification.visible).ok();

  // Check for calculation error
  await clearAndFill(t, '#monthlyPay', ' ');
  errorNotification = Selector(toastSelector).withText(
    fi.review.decisionProposal.errors.fields.calculation
  );
  await t.click(handleButton);
  await t.expect(errorNotification.visible).ok();
});

test('Open form and create a decision proposal', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  // Open already created application in index page
  const applicationLink = Selector('td')
    .withText(`Aari Hömpömpö`)
    .sibling('td')
    .nth(0)
    .find('a');
  await t.click(applicationLink);
  // // Start handling the application
  const buttonSelector = 'main button';
  const handleButton = Selector(buttonSelector).withText(fi.utility.next);
  await t.expect(handleButton.visible).ok();

  await t.click(Selector('label').withText(fi.review.fields.support));
  await t.click(handleButton);

  await t.click(
    Selector('label').withText(
      fi.review.decisionProposal.role.fields.decisionMaker.handler
    )
  );

  await t.click(
    Selector('label').withText(
      fi.review.decisionProposal.templates.fields.select.label
    )
  );

  await t.click(
    Selector('ul > li').withText('FI: Myönteisen päätöksen Päätös-osion teksti')
  );

  // Has decision text in editor
  await t
    .expect(Selector('[data-testid="decisionText"] .tiptap').child().count)
    .eql(2);

  // Has justification text in editor
  await t
    .expect(Selector('[data-testid="justificationText"] .tiptap').child().count)
    .eql(10);

  await t.click(handleButton);

  await t
    .expect(Selector('[data-testid="decision-text-preview"]').child().count)
    .eql(2);

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
