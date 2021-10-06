import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Company from '@frontend/shared/src/types/company';
import Invoicer from '@frontend/shared/src/types/invoicer';
import TestController from 'testcafe';

export const getApplicationPageComponents = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);
  const companyTable = async (company: Company) => {
    const selectors = {
      companyTable() {
        return screen.findByRole('grid', { name: /yrityksen tiedot/i });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.companyTable().exists)
          .ok(await getErrorMessage(t));
      },
      async isCompanyDataPresent() {
        await t
          .expect(screen.findByLabelText('Yritys').textContent)
          .eql(company.name, await getErrorMessage(t));
        await t
          .expect(screen.findByLabelText(/y-tunnus/i).textContent)
          .eql(company.business_id, await getErrorMessage(t));
        if (company.industry?.length > 0) {
          await t
            .expect(screen.findByLabelText(/toimiala/i).textContent)
            .eql(company.industry, await getErrorMessage(t));
        }
        if (company.street_address?.length > 0) {
          await t
            .expect(screen.findByLabelText(/yritysmuoto/i).textContent)
            .eql(company.street_address, await getErrorMessage(t));
        }
        if (company.postcode?.length > 0) {
          await t
            .expect(screen.findByLabelText(/postiosoite/i).textContent)
            .eql(company.postcode, await getErrorMessage(t));
        }
      },
    };
    const actions = {};
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const commonSelectors = {
    saveAndContinueButton: () =>
      screen.findByRole('button', {
        name: /tallenna ja jatka/i,
      }),
    previousStepButton: () =>
      screen.findByRole('button', {
        name: /palaa edelliseen/i,
      }),
  };
  const step1 = async () => {
    const formSelector = screen.getByRole('form', {
      name: /työnantajan tiedot/i,
    });
    const withinForm = (): ReturnType<typeof within> => within(formSelector);

    const selectors = {
      invoicerForm() {
        return screen.findByRole('form', {
          name: /työnantajan tiedot/i,
        });
      },
      invoicerNameInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön nimi/i,
        });
      },
      invoicerEmailInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön sähköposti/i,
        });
      },
      invoicerPhoneInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön puhelinnumero/i,
        });
      },
      saveAndContinueButton: commonSelectors.saveAndContinueButton,
      previousStepButton: commonSelectors.previousStepButton,
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.invoicerForm().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
      async isFulFilledWith({
        invoicer_name,
        invoicer_email,
        invoicer_phone_number,
      }: Invoicer) {
        await t
          .expect(selectors.invoicerForm().exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(selectors.invoicerNameInput().value)
          .eql(invoicer_name, await getErrorMessage(t));
        await t
          .expect(selectors.invoicerEmailInput().value)
          .eql(invoicer_email, await getErrorMessage(t));
        await t
          .expect(selectors.invoicerPhoneInput().value)
          .eql(invoicer_phone_number, await getErrorMessage(t));
      },
    };

    const actions = {
      async fillName(name: string) {
        setDataToPrintOnFailure(t, 'invoicer_name', name);
        const input = selectors.invoicerNameInput();
        await t
          .click(input)
          // eslint-disable-next-line sonarjs/no-duplicate-string
          .pressKey('ctrl+a delete')
          .typeText(input, name);
      },
      async fillEmail(email: string) {
        setDataToPrintOnFailure(t, 'invoicer_email', email);
        const input = selectors.invoicerEmailInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, email);
      },
      async fillPhone(phone: string) {
        setDataToPrintOnFailure(t, 'invoicer_phone_number', phone);
        const input = selectors.invoicerPhoneInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, phone);
      },
      async clickSaveAndContinueButton() {
        await t.click(selectors.saveAndContinueButton());
      },
      async clickGoToPreviousStepButton() {
        await t.click(selectors.previousStepButton());
      },
    };

    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const step2 = async () => {
    /*
    const formSelector = screen.getByRole('form', {
      name: /selvitys työsuhteesta/i,
    });
    const withinForm = (): ReturnType<typeof within> => within(formSelector);
    */
    const selectors = {
      employmentForm() {
        return screen.findByRole('form', {
          name: /selvitys työsuhteesta/i,
        });
      },
      saveAndContinueButton: commonSelectors.saveAndContinueButton,
      previousStepButton: commonSelectors.previousStepButton,
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.employmentForm().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };

    const actions = {
      async clickSaveAndContinueButton() {
        await t.click(selectors.saveAndContinueButton());
      },
      async clickGoToPreviousStepButton() {
        await t.click(selectors.previousStepButton());
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
    companyTable,
    step1,
    step2,
  };
};
