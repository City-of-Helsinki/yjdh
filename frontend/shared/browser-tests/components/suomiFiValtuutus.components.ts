import TestController from 'testcafe';

import Company from '../../src/types/company';
import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

export const getSuomiFiValtuutusComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinCompaniesTable = (): ReturnType<typeof within> =>
    within(screen.getByRole('table'));
  const withinCompanyRow = (rowNumber: number): ReturnType<typeof within> =>
    within(screen.getAllByRole('row').nth(rowNumber));
  const withinAuthorizeForm = (): ReturnType<typeof within> =>
    within(screen.getByRole('form'));

  const companiesTable = async () => {
    const selectors = {
      companiesTable() {
        return screen.findByRole('table');
      },
      companyName(rowNumber: number) {
        return withinCompanyRow(rowNumber + 1)
          .findAllByRole('cell')
          .nth(0)
          .find('label > span:last-child').textContent;
      },
      companyId(rowNumber: number) {
        return withinCompanyRow(rowNumber + 1)
          .findAllByRole('cell')
          .nth(1)
          .find('span:nth-child(2)').textContent;
      },
      selectCompanyRadioButton(companyName: string) {
        return withinCompaniesTable().findByRole('radio', {
          name: companyName,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.companiesTable().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };
    const actions = {
      async selectCompanyRadioButton(rowNumber = 1): Promise<Company> {
        const name = await selectors.companyName(rowNumber);
        const business_id = await selectors.companyId(rowNumber);
        const companyData: Company = {
          name,
          business_id,
          id: '',
          industry: '',
          street_address: '',
          postcode: '',
          city: '',
          company_form: '',
        };
        setDataToPrintOnFailure(t, 'companyData', companyData);
        await t.click(selectors.selectCompanyRadioButton(name));
        return companyData;
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
        return screen.findByRole('form');
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
