import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Company from '@frontend/shared/src/types/company';
import ContactPerson from '@frontend/shared/src/types/contact_person';
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
    const formSelector = screen.findByRole('form', {
      name: /työnantajan tiedot/i,
    });
    const withinForm = (): ReturnType<typeof within> => within(formSelector);

    const selectors = {
      employerForm() {
        return screen.findByRole('form', {
          name: /työnantajan tiedot/i,
        });
      },
      contactPersonNameInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön nimi/i,
        });
      },
      contactPersonEmailInput() {
        return withinForm().findByRole('textbox', {
          name: /yhteyshenkilön sähköposti/i,
        });
      },
      streetAddessInput() {
        return withinForm().findByRole('textbox', {
          name: /työpaikan lähiosoite/i,
        });
      },
      contactPersonPhoneInput() {
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
          .expect(selectors.employerForm().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
      async isFulFilledWith({
        contact_person_name,
        contact_person_email,
        contact_person_phone_number,
        street_address,
      }: ContactPerson) {
        await t
          .expect(selectors.employerForm().exists)
          .ok(await getErrorMessage(t));
        await t
          .expect(selectors.contactPersonNameInput().value)
          .eql(contact_person_name, await getErrorMessage(t));
        await t
          .expect(selectors.contactPersonEmailInput().value)
          .eql(contact_person_email, await getErrorMessage(t));
        await t
          .expect(selectors.streetAddessInput().value)
          .eql(street_address, await getErrorMessage(t));
        await t
          .expect(selectors.contactPersonPhoneInput().value)
          .eql(contact_person_phone_number, await getErrorMessage(t));
      },
    };

    const actions = {
      async fillContactPersonName(name: string) {
        setDataToPrintOnFailure(t, 'contact_person_name', name);
        const input = selectors.contactPersonNameInput();
        await t
          .click(input)
          // eslint-disable-next-line sonarjs/no-duplicate-string
          .pressKey('ctrl+a delete')
          .typeText(input, name);
      },
      async fillContactPersonEmail(email: string) {
        setDataToPrintOnFailure(t, 'contact_person_email', email);
        const input = selectors.contactPersonEmailInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, email);
      },
      async fillStreetAddress(address: string) {
        setDataToPrintOnFailure(t, 'street_address', address);
        const input = selectors.streetAddessInput();
        await t.click(input).pressKey('ctrl+a delete').typeText(input, address);
      },
      async fillContactPersonPhone(phone: string) {
        setDataToPrintOnFailure(t, 'contact_person_phone_number', phone);
        const input = selectors.contactPersonPhoneInput();
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
    const formSelector = screen.findByRole('form', {
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
