import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { ClientFunction, Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

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

  const errorTag = Selector('td')
    .withText(`Juno Yucca-Palmu`)
    .parent()
    .find('#hds-tag span')
    .withText(fi.applications.list.columns.talpaStatuses.rejected_by_talpa);
  await t.expect(errorTag.visible).ok();
  await t.click(errorTag);

  await t
    .expect(
      Selector('h2').withText(fi.applications.dialog.talpaStatusChange.heading)
        .visible
    )
    .ok();

  await t.click(
    Selector('button').withText(fi.applications.list.actions.return_as_waiting)
  );

  await t
    .expect(
      Selector('#hds-tag').withText(
        fi.applications.list.columns.talpaStatuses.not_sent_to_talpa
      ).visible
    )
    .ok();
});

test('Handler changes Talpa status to paid', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  await t.click(
    Selector('li').withText(fi.applications.list.headings.inPayment)
  );

  const errorTag = Selector('td')
    .withText(`Milamassa Saragossa`)
    .parent()
    .find('#hds-tag span')
    .withText(fi.applications.list.columns.talpaStatuses.rejected_by_talpa);
  await t.expect(errorTag.visible).ok();
  await t.click(errorTag);

  await t
    .expect(
      Selector('h2').withText(fi.applications.dialog.talpaStatusChange.heading)
        .visible
    )
    .ok();

  await t.click(
    Selector('button').withText(fi.applications.list.actions.mark_as_paid)
  );

  await t.click(Selector('a').withText(fi.header.navigation.archive));
  await t.expect(Selector('td').withText(`Saragossa, Milamassa`).visible).ok();
});

test('Handler changes 2nd instalment status waiting', async (t: TestController) => {
  const mainIngress = new MainIngress(fi.mainIngress.heading, 'h1');
  await mainIngress.isLoaded();

  await t.click(
    Selector('li').withText(fi.applications.list.headings.instalments)
  );

  const checkbox = Selector('td[data-testid="applicationNum-0"]')
    .withText(`125000`)
    .parent()
    .find('input[type="checkbox"]');
  await t.expect(checkbox.visible).ok();
  await t.click(checkbox);

  await t.click(
    Selector('button').withText(fi.applications.list.actions.confirm)
  );

  await t.click(
    Selector('button').withText(fi.applications.list.actions.return)
  );

  await t.click(
    Selector('button').withText(fi.applications.list.actions.cancel)
  );

  await t
    .expect(
      Selector('h3').withText(fi.instalments.dialog.cancelInstalment.heading)
        .visible
    )
    .ok();

  await t.click(Selector('button').withText(fi.utility.confirm));

  await t
    .expect(
      Selector('td').withText(
        fi.applications.list.columns.instalmentStatuses.cancelled
      ).visible
    )
    .ok();
});
