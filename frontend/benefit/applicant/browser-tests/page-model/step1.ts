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

  private businessActivitiesFalse = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields
          .associationHasBusinessActivities.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.no,
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

  hasImmediateManagerCheckbox = this.component.findByRole('checkbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .associationImmediateManagerCheck.placeholder
    ),
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

  public async fillEmployerInfo(
    iban: string,
    isAssociation: boolean
  ): Promise<void> {
    if (isAssociation) {
      await this.clickSelectRadioButton(this.hasImmediateManagerCheckbox);
      await this.clickSelectRadioButton(this.businessActivitiesFalse);
    }
    await this.fillInput(this.bankAccountNumber, iban);
  }

  public async fillContactPerson(
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ): Promise<void> {
    await this.fillInput(this.firstName, firstName);
    await this.fillInput(this.lastName, lastName);
    await this.fillInput(this.phoneNumber, phoneNumber);
    return this.fillInput(this.email, email);
  }

  public selectNoBusinessActivities(): Promise<void> {
    return this.clickSelectRadioButton(this.businessActivitiesFalse);
  }

  public selectNoDeMinimis(): Promise<void> {
    return this.clickSelectRadioButton(this.deMinimisAidFalse);
  }

  public selectNocoOperationNegotiations(): Promise<void> {
    return this.clickSelectRadioButton(this.coOperationNegotiationsFalse);
  }
}

export default Step1;
