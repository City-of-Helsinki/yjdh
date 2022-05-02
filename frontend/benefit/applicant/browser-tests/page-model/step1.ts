import WizardStep from './WizardStep';

class Step1 extends WizardStep {
  constructor() {
    super(1);
  }

  private bankAccountNumber = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyBankAccountNumber.label
    ),
  });

  private firstName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyContactPersonFirstName.label
    ),
  });
  private lastName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyContactPersonLastName.label
    ),
  });

  private phoneNumber = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyContactPersonPhoneNumber.label
    ),
  });
  private email = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyContactPersonEmail.label
    ),
  });

  private deMinimisAidFalse = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields.deMinimisAid
          .label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields.deMinimisAid
      .no,
  });

  private coOperationNegotiationsFalse = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields
          .coOperationNegotiations.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields
      .coOperationNegotiations.no,
  });

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
}

export default Step1;
