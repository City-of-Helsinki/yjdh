import { fillInput } from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import Company from '@frontend/shared/src/types/company';
import ContactInfo from '@frontend/shared/src/types/contact-info';
import { friendlyFormatIBAN } from 'ibantools';
import TestController from 'testcafe';

export const getStep1Components = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);
  const companyTable = async (company: Company) => {
    const selectors = {
      companyTable() {
        return screen.findAllByRole('region', { name: /yrityksen tiedot/i });
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

  const formSelector = () =>
    screen.findByRole('form', {
      name: /työnantajan tiedot/i,
    });

  const withinForm = (): ReturnType<typeof within> => within(formSelector());

  const form = async () => {
    const selectors = {
      contactPersonNameInput() {
        return withinForm().findByRole('textbox', {
          name: /^yhteyshenkilön nimi/i,
        });
      },
      contactPersonEmailInput() {
        return withinForm().findByRole('textbox', {
          name: /^yhteyshenkilön sähköposti/i,
        });
      },
      contactPersonPhoneInput() {
        return withinForm().findByRole('textbox', {
          name: /^yhteyshenkilön puhelinnumero/i,
        });
      },
      streetAddessInput() {
        return withinForm().findByRole('textbox', {
          name: /^työpaikan lähiosoite/i,
        });
      },
      bankAccountNumberInput() {
        return withinForm().findByRole('textbox', {
          name: /^tilinumero/i,
        });
      },
      separateInvoicerCheckbox() {
        return withinForm().getByLabelText(
          /^laskutusta hoitaa yrityksessä eri yhteyshenkilö/i
        );
      },
      invoicerNameInput() {
        return withinForm().findByRole('textbox', {
          name: /^laskutuksen yhteyshenkilön nimi/i,
        });
      },
      invoicerEmailInput() {
        return withinForm().findByRole('textbox', {
          name: /^laskutuksen yhteyshenkilön sähköposti/i,
        });
      },
      invoicerPhoneInput() {
        return withinForm().findByRole('textbox', {
          name: /^laskutuksen yhteyshenkilön puhelinnumero/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(formSelector().exists).ok(await getErrorMessage(t));
      },
      async isFulFilledWith({
        contact_person_name,
        contact_person_email,
        contact_person_phone_number,
        bank_account_number,
        street_address,
      }: ContactInfo) {
        await t.expect(formSelector().exists).ok(await getErrorMessage(t));
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
          .expect(selectors.bankAccountNumberInput().value)
          .eql(
            friendlyFormatIBAN(bank_account_number),
            await getErrorMessage(t)
          );
        await t
          .expect(selectors.contactPersonPhoneInput().value)
          .eql(contact_person_phone_number, await getErrorMessage(t));
      },
    };

    const actions = {
      fillContactPersonName(name: string) {
        return fillInput(
          t,
          'contact_person_name',
          selectors.contactPersonNameInput(),
          name
        );
      },
      fillContactPersonEmail(email: string) {
        return fillInput(
          t,
          'contact_person_email',
          selectors.contactPersonEmailInput(),
          email
        );
      },
      fillContactPersonPhone(phone: string) {
        return fillInput(
          t,
          'contact_person_phone_number',
          selectors.contactPersonPhoneInput(),
          phone
        );
      },
      fillStreetAddress(address: string) {
        return fillInput(
          t,
          'street_address',
          selectors.streetAddessInput(),
          address
        );
      },
      fillBankAccountNumber(address: string) {
        return fillInput(
          t,
          'street_address',
          selectors.bankAccountNumberInput(),
          address
        );
      },
      async selectSeparateInvoicerCheckbox(expectedValue = true) {
        const currentValue = await selectors.separateInvoicerCheckbox().checked;
        if (currentValue !== expectedValue) {
          await t.click(selectors.separateInvoicerCheckbox());
        }
      },
      fillInvoicerName(name?: string) {
        return fillInput(
          t,
          'invoicer_name',
          selectors.invoicerNameInput(),
          name
        );
      },
      fillInvoicerEmail(email?: string) {
        return fillInput(
          t,
          'invoicer_email',
          selectors.invoicerEmailInput(),
          email
        );
      },
      fillInvoicerPhone(phone?: string) {
        return fillInput(
          t,
          'invoicer_phone_number',
          selectors.invoicerPhoneInput(),
          phone
        );
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
    form,
  };
};
