import { t } from 'testcafe';

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

  private businessActivitiesTrue = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields
          .associationHasBusinessActivities.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields
      .associationHasBusinessActivities.yes,
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

  private deMinimisAidTrue = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields.deMinimisAid
          .label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields.deMinimisAid
      .yes,
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

  private coOperationNegotiationsTrue = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.company.fields
          .coOperationNegotiations.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.company.fields
      .coOperationNegotiations.yes,
  });

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
    await this.fillInput(this.firstName, firstName);
    await this.fillInput(this.lastName, lastName);
    await this.fillInput(this.phoneNumber, phoneNumber);
    return this.fillInput(this.email, email);
  }

  public async fillDeminimisAid(
    granter?: string,
    amount?: string,
    grantedAt?: string
  ): Promise<void> {
    if (granter) await this.fillInput(this.deminimisGranter, granter);
    if (amount) await this.fillInput(this.deminimisAmount, amount);
    if (grantedAt) await this.fillInput(this.deminimisGrantedAt, grantedAt);
    return this.clickDeminimisSave();
  }

  public async fillCoOperationNegotiationsDescription(
    clarification: string
  ): Promise<void> {
    await this.fillInput(
      this.coOperationNegotiationsDescription,
      clarification
    );
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
