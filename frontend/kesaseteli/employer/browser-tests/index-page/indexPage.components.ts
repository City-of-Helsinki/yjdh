// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type, testing-library/await-async-query, security/detect-non-literal-fs-filename */
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

export const getIndexPageComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinFrontPage = () => within(screen.getByRole('main'));

  const header = async () => {
    const selectors = {
      header() {
        return screen.findByRole('heading', {
          name: /työnantajan liittymä/i,
        });
      },
      userName(name: User['name']) {
        // eslint-disable-next-line security/detect-non-literal-regexp
        return withinFrontPage().findByText(new RegExp(name, 'i'));
      },
      createNewApplicationButton() {
        return withinFrontPage().findByRole('button', {
          name: /luo uusi hakemus/i,
        });
      },
      logoutButton() {
        return withinFrontPage().findByRole('button', {
          name: /kirjaudu ulos/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
      },
      async userNameIsPresent({ name }: User) {
        await t.expect(name).ok(await getErrorMessage(t));
        await t
          .expect(selectors.userName(name).exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickCreateNewApplicationButton() {
        await t.click(selectors.createNewApplicationButton());
      },
      async clickLogoutButton() {
        await t.click(selectors.logoutButton());
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
    header,
  };
};
