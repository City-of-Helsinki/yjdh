import { Selector, t } from 'testcafe';

import ApplicantPageComponent from './ApplicantPageComponent';

class Step1 extends ApplicantPageComponent {
  constructor() {
    super({ datatestId: 'step-1' });
  }

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

  public fillEmployerInfo(iban: string): Promise<void> {
    return Step1.fillInput(this.bankAccountNumber, iban);
  }

  public async fillContactPerson(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ): Promise<void> {
    await Step1.fillInput(this.firstName, firstName);
    await Step1.fillInput(this.lastName, lastName);
    await Step1.fillInput(this.phoneNumber, phoneNumber);
    return Step1.fillInput(this.email, email);
  }

  public selectNoDeMinimis(): Promise<void> {
    return Step1.clickSelectRadioButton(this.deMinimisAidFalse);
  }

  public selectNocoOperationNegotiations(): Promise<void> {
    return Step1.clickSelectRadioButton(this.coOperationNegotiationsFalse);
  }

  async submit() {
    await t.click(this.nextButton);
  }
}

export default Step1;
