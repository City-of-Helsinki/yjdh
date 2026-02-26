import { screenContext } from '@frontend/shared/browser-tests/utils/testcafe.utils';

export const getDashboardComponents = (t: TestController) => {
    const screen = screenContext(t);
    const selectors = {
        dashboardTitle() {
            return screen.findByRole('heading', { name: /kesäseteli - työnantajaportaali/i });
        },
        createNewApplicationButton() {
            return screen.findByRole('button', { name: /(luo|tee) uusi hakemus/i });
        },
        previousApplicationsTitle() {
            return screen.findByRole('heading', { name: /aiemmat kesäsetelihakemukset/i });
        },
        applicationRow(employeeName: string) {
            return screen.findByRole('cell', { name: new RegExp(`^${employeeName}$`, 'i') });
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
    };
    const actions = {
        async clickCreateNewApplication() {
            await t.click(selectors.createNewApplicationButton());
        },
    };
    return {
        selectors,
        expectations,
        actions,
    };
};
