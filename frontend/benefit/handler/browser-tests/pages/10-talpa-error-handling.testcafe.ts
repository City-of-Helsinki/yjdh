import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { ClientFunction, Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

const escapeRegExp = (value: string): string =>
  value.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');

const getEmployeeRow = (firstName: string, lastName: string): Selector => {
  const escapedFirstName = escapeRegExp(firstName);
  const escapedLastName = escapeRegExp(lastName);

  return Selector('tr')
    .filterVisible()
    .withText(
      new RegExp(
        `${escapedFirstName}\\s+${escapedLastName}|${escapedLastName},\\s*${escapedFirstName}|${escapedLastName}\\s+${escapedFirstName}|${escapedFirstName},\\s*${escapedLastName}`
      )
    );
};

const getVisibleTextInRow = (row: Selector, text: string): Selector =>
  row.find('*').withText(text).filterVisible();

const rowContainsText = async (
  row: Selector,
  text: string
): Promise<boolean> => {
  const rowText = await row.textContent;
  return rowText?.includes(text) ?? false;
};

const changeTalpaErrorStatus = async (
  t: TestController,
  applicationRow: Selector,
  actionLabel: string
): Promise<void> => {
  const errorTag = getVisibleTextInRow(
    applicationRow,
    fi.applications.list.columns.talpaStatuses.rejected_by_talpa
  );

  await t.expect(errorTag.visible).ok();
  await t.click(errorTag);
  await t
    .expect(
      Selector('h2').withText(fi.applications.dialog.talpaStatusChange.heading)
        .visible
    )
    .ok();
  await t.click(Selector('button').withText(actionLabel));
};

const openArchiveAndExpectApplication = async (
  t: TestController,
  employeeName: string
): Promise<void> => {
  await t.click(Selector('a').withText(fi.header.navigation.archive));
  await t
    .expect(Selector('td').withText(employeeName).visible)
    .ok({ timeout: 10_000 });
};

fixture('Talpa error resolution by handler')
  .page(url)
  .clientScripts({
    content: 'window.localStorage.setItem("newAhjoMode", "1");',
  })
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
    await ClientFunction(() =>
      window.localStorage.setItem('newAhjoMode', '1')
    )();
    await t.navigateTo('/');
  });

test('Handler changes Talpa status to waiting', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  await t.click(
    Selector('li').withText(fi.applications.list.headings.inPayment)
  );

  const applicationRow = getEmployeeRow('Juno', 'Yucca-Palmu');
  await t.expect(applicationRow.exists).ok();
  const waitingStatus =
    fi.applications.list.columns.talpaStatuses.not_sent_to_talpa;

  if (!(await rowContainsText(applicationRow, waitingStatus))) {
    await changeTalpaErrorStatus(
      t,
      applicationRow,
      fi.applications.list.actions.return_as_waiting
    );
  }

  await t
    .expect(getVisibleTextInRow(applicationRow, waitingStatus).visible)
    .ok({ timeout: 10_000 });
});

test('Handler changes Talpa status to paid', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  await t.click(
    Selector('li').withText(fi.applications.list.headings.inPayment)
  );

  const applicationRow = getEmployeeRow('Milamassa', 'Saragossa');

  // A previous run marks this fixture as paid and moves it to the archive.
  if (!(await applicationRow.exists)) {
    await openArchiveAndExpectApplication(t, 'Saragossa, Milamassa');
    return;
  }

  await t.expect(applicationRow.exists).ok();
  await changeTalpaErrorStatus(
    t,
    applicationRow,
    fi.applications.list.actions.mark_as_paid
  );

  await openArchiveAndExpectApplication(t, 'Saragossa, Milamassa');
});
