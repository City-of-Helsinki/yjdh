import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getNotificationPageComponents = async (
  t: TestController,
  {
    headerText,
    buttonText,
  }: { headerText: string | RegExp; buttonText?: string }
) => {
  const screen = screenContext(t);
  const selectors = {
    header() {
      return screen.findByRole('heading', {
        name: headerText,
      });
    },
    goToFrontPageButton() {
      return screen.findByRole('button', {
        name: buttonText ?? 'Kesäseteli etusivulle',
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {
    async clickGoToFrontPageButton() {
      await t.click(selectors.goToFrontPageButton());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
