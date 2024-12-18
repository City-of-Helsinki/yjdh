import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('Talpa error resolution by handler')
  .page(url)
  .beforeEach(async (t) => {
    clearDataToPrintOnFailure(t);
    await t.useRole(handlerUserAhjo);
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

  await t.navigateTo('/archive');
  await t.expect(Selector('td').withText(`Saragossa, Milamassa`).visible).ok();
});
