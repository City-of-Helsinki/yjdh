// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable testing-library/await-async-query, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
import TestController from 'testcafe';

import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

export const getSuomiFiTestIdentificationComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinPage = (): ReturnType<typeof within> =>
    within(screen.getByRole('main'));

  const withinForm = (): ReturnType<typeof within> => within('#login-form');

  const identificationForm = async () => {
    const selectors = {
      identificationForm() {
        return withinPage().findByRole('heading', {
          name: /testitunnistaja/i,
        });
      },
      defaultSSNLink() {
        return withinForm().findByRole('link', {
          name: /käytä oletusta/i,
        });
      },
      submitButton() {
        return withinPage().findByRole('button', {
          name: /tunnistaudu/i,
        });
      },
    };

    const expectations = {
      async isPresent() {
        await t
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          .expect(selectors.identificationForm().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async selectTestitunnistajaAuthentication() {
        await t.click(selectors.defaultSSNLink());
      },
      async clickSubmitButton() {
        await t.click(selectors.submitButton());
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
    identificationForm,
  };
};
