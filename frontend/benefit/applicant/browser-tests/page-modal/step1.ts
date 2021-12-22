import { t, Selector } from 'testcafe';

class Step1 {
  newApplicationHeading = Selector('h1').withText('Uusi hakemus');

  bankAccountNumber = Selector('input').withAttribute(
    'name',
    'companyBankAccountNumber'
  );

  firstName = Selector('input').withAttribute(
    'name',
    'companyContactPersonFirstName'
  );
  lastName = Selector('input').withAttribute(
    'name',
    'companyContactPersonLastName'
  );
  phoneNumber = Selector('input').withAttribute(
    'name',
    'companyContactPersonPhoneNumber'
  );
  email = Selector('input').withAttribute('name', 'companyContactPersonEmail');

  deMinimisAidFalse = Selector('#deMinimisAidFalse');

  coOperationNegotiationsFalse = Selector('#coOperationNegotiationsFalse');

  nextButton = Selector('button').withAttribute('data-testid', 'nextButton');

  async fillEmployerInfo(iban: string) {
    await t.typeText(this.bankAccountNumber, iban);
  }

  async fillContactPerson(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ) {
    await t
      .typeText(this.firstName, firstName)
      .typeText(this.lastName, lastName)
      .typeText(this.phoneNumber, phoneNumber)
      .typeText(this.email, email);
  }

  async selectNoDeMinimis() {
    await t.click(this.deMinimisAidFalse);
  }

  async selectNocoOperationNegotiations() {
    await t.click(this.coOperationNegotiationsFalse);
  }

  async submit() {
    await t.click(this.nextButton);
  }
}

export default new Step1();
