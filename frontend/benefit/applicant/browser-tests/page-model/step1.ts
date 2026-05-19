import { Selector, t } from 'testcafe';

import WizardStep from './WizardStep';

class Step1 extends WizardStep {
  constructor() {
    super(1);
  }

  private formSelector = Selector('form#employer-application-form');

  private bankAccountNumber = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyBankAccountNumber.label
    ),
  });

  private companyNumberOfEmployees = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyNumberOfEmployees.label
    ),
  });

  private companyBusinessBrief = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.company.fields
        .companyBusinessBrief.label
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

  private deMinimisAidFalse = Selector('#deMinimisAidFalse');

  private deMinimisAidTrue = Selector('#deMinimisAidTrue');

  private coOperationNegotiationsFalse = Selector(
    '#coOperationNegotiationsFalse'
  );

  private coOperationNegotiationsTrue = Selector(
    '#coOperationNegotiationsTrue'
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

  private async clickRadioInput(
    inputSelector: Selector,
    labelCssSelector: string
  ): Promise<void> {
    const radioInput = inputSelector.with({ timeout: 10_000 });

    await t.expect(radioInput.exists).ok({ timeout: 10_000 });
    await t.scrollIntoView(radioInput);
    await this.htmlElementClick(labelCssSelector);
    await t.expect(radioInput.checked).ok({ timeout: 5000 });
  }

  public async fillEmployerInfo(
    iban: string,
    companyNumberOfEmployees: string,
    companyBusinessBrief: string
  ): Promise<void> {
    await t.expect(this.formSelector.exists).ok({ timeout: 60_000 });
    await this.fillInput(this.bankAccountNumber, iban);
    await this.fillInput(
      this.companyNumberOfEmployees,
      companyNumberOfEmployees
    );
    await this.fillInput(this.companyBusinessBrief, companyBusinessBrief);
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

  public async selectDeMinimis(yes: boolean): Promise<void> {
    if (yes) {
      await this.clickRadioInput(
        this.deMinimisAidTrue,
        'label[for="deMinimisAidTrue"]'
      );
      return;
    }

    await this.clickRadioInput(
      this.deMinimisAidFalse,
      'label[for="deMinimisAidFalse"]'
    );
  }

  public async selectCoOperationNegotiations(yes: boolean): Promise<void> {
    if (yes) {
      await this.clickRadioInput(
        this.coOperationNegotiationsTrue,
        'label[for="coOperationNegotiationsTrue"]'
      );
      return;
    }

    await this.clickRadioInput(
      this.coOperationNegotiationsFalse,
      'label[for="coOperationNegotiationsFalse"]'
    );
  }
}

export default Step1;
