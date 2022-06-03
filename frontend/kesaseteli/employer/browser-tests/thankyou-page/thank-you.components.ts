import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { getSummaryComponents } from '../application-page/summary.components';

export const getThankYouPageComponents = (t: TestController) => {
  const screen = screenContext(t);
  const summaryComponent = () => getSummaryComponents(t);

  const header = async () => {
    const selectors = {
      header: () =>
        screen.findByRole('heading', { name: /^hakemus on lähetetty/i }),
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
    };
  };

  const createNewApplicationButton = async () => {
    const selectors = {
      button: () => screen.findByRole('button', { name: /^tee uusi hakemus/i }),
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.button().exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickButton() {
        return t.click(selectors.button());
      },
    };
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    header,
    summaryComponent,
    createNewApplicationButton,
  };
};
