import TestController, { Selector } from 'testcafe';

import { getErrorMessage, withinContext } from '../utils/testcafe.utils';

export const getSuomiFiValtuutusComponents = (t: TestController) => {
  const within = withinContext(t);

  const withinCompaniesTable = (): ReturnType<typeof within> =>
    within('div[class^="Kapa-Table"] > table');
  const withinAuthorizeForm = (): ReturnType<typeof within> =>
    within('form[name="authorizeForm"]');

  const companiesTable = async () => {
    const selectors = {
      companiesTable() {
        return Selector('div[class^="Kapa-Table"] > table');
      },
      selectCompanyRadioButton(companyName: RegExp) {
        return withinCompaniesTable().findByRole('radio', {
          name: companyName,
        });
      },
    };

    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.companiesTable().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async selectCompanyRadioButton(name: RegExp) {
        await t.click(selectors.selectCompanyRadioButton(name));
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const authorizeForm = async () => {
    const selectors = {
      authorizeForm() {
        return Selector('form[name="authorizeForm"]');
      },
      submitButton() {
        return withinAuthorizeForm().findByRole('button', {
          name: /valitse ja siirry asiointipalveluun/i,
        });
      },
    };

    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.authorizeForm().exists)
          .ok(await getErrorMessage(t));
      },
    };
    const actions = {
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
    companiesTable,
    authorizeForm,
  };
};
