import { screenContext } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getDashboardComponents = (t: TestController) => {
  const screen = screenContext(t);
  const selectors = {
    dashboardTitle() {
      return screen.findByRole('heading', {
        name: /työnantajan kesäsetelihakemukset/i,
      });
    },
    createNewApplicationButton() {
      return screen.findByRole('button', { name: /(luo|tee) uusi hakemus/i });
    },
    previousApplicationsTitle() {
      return screen.findByRole('heading', {
        name: /aiemmat kesäsetelihakemukset/i,
      });
    },
    applicationRow(employeeName: string) {
      return screen.findByRole('cell', {
        name: new RegExp(`^${employeeName}$`, 'i'),
      });
    },
    editApplicationButton(employeeName: string) {
      return screen.findByRole('button', {
        name: new RegExp(
          `(muokkaa hakemusta: ${employeeName}|edit application: ${employeeName}|redigera ansökan: ${employeeName}|muokkaa|edit|redigera)`,
          'i'
        ),
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.dashboardTitle().exists).ok();
      await t.expect(selectors.createNewApplicationButton().exists).ok();
    },
    async hasApplication(employeeName: string) {
      await t.expect(selectors.applicationRow(employeeName).exists).ok();
    },
    async hasNoApplication(employeeName: string) {
      await t.expect(selectors.applicationRow(employeeName).exists).notOk();
    },
  };
  const actions = {
    async clickCreateNewApplication() {
      await t.click(selectors.createNewApplicationButton());
    },
    async clickEditApplication(employeeName: string) {
      await t.click(selectors.editApplicationButton(employeeName));
    },
  };
  return {
    selectors,
    expectations,
    actions,
  };
};
