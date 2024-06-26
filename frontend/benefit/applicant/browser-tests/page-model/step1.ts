import { Selector, t } from 'testcafe';

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

  private deminimisAmount = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields.deMinimisAidAmount
        .label
    ),
  });

  private deminimisGranter = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields.deMinimisAidGranter
        .label
    ),
  });

  private deminimisGrantedAt = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .deMinimisAidGrantedAt.label
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

  private businessActivitiesFalse = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.label,
    this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.no
  );

  private businessActivitiesTrue = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.label,
    this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.yes
  );

  private deMinimisAidFalse = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields.deMinimisAid.label,
    this.translations.applications.sections.company.fields.deMinimisAid.no
  );

  private deMinimisAidTrue = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields.deMinimisAid.label,
    this.translations.applications.sections.company.fields.deMinimisAid.yes
  );

  hasImmediateManagerCheckbox = this.component.findByRole('checkbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .associationImmediateManagerCheck.placeholder
    ),
  });

  private coOperationNegotiationsFalse = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields
      .coOperationNegotiations.label,
    this.translations.applications.sections.company.fields
      .coOperationNegotiations.no
  );

  private coOperationNegotiationsTrue = this.findRadioLabelWithGroupText(
    this.translations.applications.sections.company.fields
      .coOperationNegotiations.label,
    this.translations.applications.sections.company.fields
      .coOperationNegotiations.yes
  );

  private coOperationNegotiationsDescription = this.component.findByRole(
    'textbox',
    {
      name: this.regexp(
        this.translations.applications.sections.company.fields
          .coOperationNegotiationsDescription.label
      ),
    }
  );

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
    await t.typeText(this.firstName, firstName);
    await t.typeText(this.lastName, lastName);
    await t.typeText(this.phoneNumber, phoneNumber);
    return t.typeText(this.email, email);
  }

  public async fillDeminimisAid(
    granter?: string,
    amount?: string,
    grantedAt?: string
  ): Promise<void> {
    if (granter) await t.typeText(this.deminimisGranter, granter);
    if (amount) await t.typeText(this.deminimisAmount, amount);
    if (grantedAt) await t.typeText(this.deminimisGrantedAt, grantedAt);
    return this.clickDeminimisSave();
  }

  public async fillCoOperationNegotiationsDescription(
    clarification: string
  ): Promise<void> {
    await t.typeText(this.coOperationNegotiationsDescription, clarification);
  }

  private deminimisSave = this.component.findByRole('button', {
    name: this.translations.applications.sections.company.deMinimisAidsAdd,
  });

  private deminimisRemove = (index: number): SelectorPromise =>
    this.component.findByTestId(`deminimis-remove-${index}`);

  public clickDeminimisSave(): Promise<void> {
    return t.click(this.deminimisSave);
  }

  public clickDeminimisRemove(index: number): Promise<void> {
    return t.click(this.deminimisRemove(index));
  }

  public selectBusinessActivities(yes: boolean): Promise<void> {
    if (yes) return this.clickSelectRadioButton(this.businessActivitiesFalse);
    return this.clickSelectRadioButton(this.businessActivitiesTrue);
  }

  public selectDeMinimis(yes: boolean): Promise<void> {
    if (yes) return this.clickSelectRadioButton(this.deMinimisAidTrue);
    return this.clickSelectRadioButton(this.deMinimisAidFalse);
  }

  public selectCoOperationNegotiations(yes: boolean): Promise<void> {
    if (yes)
      return this.clickSelectRadioButton(this.coOperationNegotiationsTrue);
    return this.clickSelectRadioButton(this.coOperationNegotiationsFalse);
  }
}

export default Step1;
