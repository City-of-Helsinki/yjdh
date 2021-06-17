import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { MAIN_CONTENT_ID } from '@frontend/shared/src/constants';
import TestController from 'testcafe';

export const getIndexPageComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinMainContent = () => within(screen.getByTestId(MAIN_CONTENT_ID));

  const mainContent = async () => {
    const selectors = {
      header() {
        return withinMainContent().findByRole('heading', {
          name: /työnantajan liittymä/i,
        });
      },
      createNewApplicationButton() {
        return withinMainContent().findByRole('button', {
          name: /luo uusi hakemus/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickCreateNewApplicationButton() {
        await t.click(selectors.createNewApplicationButton());
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    mainContent,
  };
};
