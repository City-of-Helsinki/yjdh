import TestController from 'testcafe';

import User from '../../src/types/user';
import {
  getErrorMessage,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

export const getSuomiFiProfileComponents = (t: TestController) => {
  const within = withinContext(t);

  const withinForm = (): ReturnType<typeof within> => within('#attribute-form');

  const profileForm = async () => {
    const selectors = {
      ssn() {
        return withinForm()
          .findByRole('cell', { name: /henkilötunnus/i })
          .nextSibling();
      },
      lastName() {
        return withinForm()
          .findByRole('cell', { name: /sukunimi/i })
          .nextSibling();
      },
      firstName() {
        return withinForm()
          .findByRole('cell', { name: /etunimet/i })
          .nextSibling();
      },
      continueButton() {
        return withinForm().findByRole('button', {
          name: /jatka palveluun/i,
        });
      },
    };

    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.continueButton().exists)
          .ok(await getErrorMessage(t));
      },
      async userDataIsPresent(): Promise<User> {
        const national_id_num = (await selectors.ssn().textContent).trim();
        const given_name = (await selectors.firstName().textContent).trim();
        const family_name = (await selectors.lastName().textContent).trim();

        const userData: User = {
          national_id_num,
          given_name,
          family_name,
          name: `${given_name} ${family_name}`,
        };

        setDataToPrintOnFailure(t, 'userData', userData);
        return userData;
      },
    };
    const actions = {
      async clickContinueButton() {
        await t.click(selectors.continueButton());
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
    profileForm,
  };
};
