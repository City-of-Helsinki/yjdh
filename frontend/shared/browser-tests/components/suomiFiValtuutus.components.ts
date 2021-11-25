import TestController from 'testcafe';

import { DEFAULT_LANGUAGE } from '../../src/i18n/i18n';
import Company from '../../src/types/company';
import { clickSelectRadioButton } from '../utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '../utils/testcafe.utils';

const translations = {
  fi: {
    submitButton: /valitse ja siirry asiointipalveluun/i,
  },
  sv: {
    submitButton: /välj och gå till e-tjänsten/i,
  },
  en: {
    submitButton: /select and go to the e-service/i,
  },
};

export const getSuomiFiValtuutusComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinCompaniesTable = (): ReturnType<typeof within> =>
    within(screen.findByRole('table'));
  const withinCompanyRow = (rowNumber: number): ReturnType<typeof within> =>
    within(screen.findAllByRole('row').nth(rowNumber));
  const withinAuthorizeForm = (): ReturnType<typeof within> =>
    within(screen.findByRole('form'));

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
        await clickSelectRadioButton(
          t,
          selectors.selectCompanyRadioButton(name)
        );
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
      submitButton(
        buttonTranslationText = /valitse ja siirry asiointipalveluun/i
      ) {
        return withinAuthorizeForm().findByRole('button', {
          name: buttonTranslationText,
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
      async clickSubmitButton(lang = DEFAULT_LANGUAGE) {
        await t.click(selectors.submitButton(translations[lang].submitButton));
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
