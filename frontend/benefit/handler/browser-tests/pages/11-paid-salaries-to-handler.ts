import { clearDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { ClientFunction, Selector } from 'testcafe';

import fi from '../../public/locales/fi/common.json';
import MainIngress from '../page-model/MainIngress';
import handlerUserAhjo from '../utils/handlerUserAhjo';
import { getFrontendUrl } from '../utils/url.utils';

const url = getFrontendUrl(`/`);

fixture('2nd instalment paid salaries handling')
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

test('Handler sets 2nd instalment status to accepted', async (t: TestController) => {
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
    Selector('span').withText(fi.applications.decision.instalments)
  );

  await t.click(
    Selector('span').withText(fi.applications.paidSalaries.heading)
  );

  await t.expect(
    Selector('h2').withText(fi.applications.paidSalaries.payslipHeading).visible
  ).ok();

  await t.click(
    Selector('button').withText(fi.applications.paidSalaries.buttons.setAccepted)
  );

  await t.expect(
    Selector('span').withText(fi.applications.list.columns.instalmentStatuses.accepted).visible
  ).ok();

});

test('Handler sets 2nd instalment status to pending', async (t: TestController) => {
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
    Selector('button').withText(fi.applications.list.actions.return)
  );

  await t.click(
    Selector('button').withText(fi.applications.list.actions.confirm)
  );

  await t.click(
    Selector('span').withText(fi.applications.decision.instalments)
  );

  await t.click(
    Selector('span').withText(fi.applications.paidSalaries.heading)
  );

  await t
    .expect(
      Selector('h2').withText(fi.applications.paidSalaries.payslipHeading)
        .visible
    )
    .ok();

  await t.click(
    Selector('button').withText(
      fi.applications.paidSalaries.buttons.setPending
    )
  );

  await t
    .expect(
      Selector('span').withText(
        fi.applications.list.columns.instalmentStatuses.pending
      ).visible
    )
    .ok();
});

test('upload sample.pdf from PaidSalariesAccordion', async (t) => {
  const uploadButton = Selector('button').withText('Liitä tiedosto');
  const fileInput = Selector('input[type="file"]#paid-salaries-upload');
  const samplePdfPath = "sample.pdf";
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
    Selector('span').withText(fi.applications.decision.instalments)
  );

  await t.click(
    Selector('span').withText(fi.applications.paidSalaries.heading)
  );

  await t
    .expect(
      Selector('h2').withText(fi.applications.paidSalaries.payslipHeading)
        .visible
    )
    .ok();

  await t.click(uploadButton).setFilesToUpload(fileInput, samplePdfPath);
  await t.expect(
    Selector('a').withText('.pdf').visible
  ).ok();
});


test('Handler deletes a file', async (t: TestController) => {
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
    Selector('span').withText(fi.applications.paidSalaries.heading)
  );

  await t
    .expect(
      Selector('h2').withText(fi.applications.paidSalaries.payslipHeading)
        .visible
    )
    .ok();

  await t.click(
    Selector('button').withText(fi.applications.paidSalaries.buttons.delete)
  );

  await t.expect(Selector('a').withText('.pdf').visible).notOk();
});

