import WizardStep from './WizardStep';

class Step2 extends WizardStep {
  constructor() {
    super(2);
  }

  private firstName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.firstName.label
    ),
  });

  private lastName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.lastName.label
    ),
  });

  private ssn = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .socialSecurityNumber.label
    ),
  });

  isLivingInHelsinkiCheckbox = this.component.findByRole('checkbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.isLivingInHelsinki
        .placeholder
    ),
  });

  private paidSubsidyDefault = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.employee.fields
          .paySubsidyGranted.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.employee.fields
      .paySubsidyGranted.paySubsidyDefault,
  });

  private apprenticeshipProgramFalse = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.employee.fields
          .apprenticeshipProgram.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.employee.fields
      .apprenticeshipProgram.no,
  });

  private benefitTypeEmployment = this.component.findByRole('radio', {
    name: this.translations.applications.sections.employee.fields.benefitType
      .employment,
  });

  private startDate = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.startDate.label
    ),
  });

  private endDate = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.endDate.label
    ),
  });

  private jobTitle = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.jobTitle.label
    ),
  });

  private workingHours = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.workingHours.label
    ),
  });

  private collectiveBargainingAgreement = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .collectiveBargainingAgreement.label
    ),
  });

  private monthlyPay = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.monthlyPay.label
    ),
  });

  private otherExpenses = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.otherExpenses
        .label
    ),
  });

  private vacationMoney = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.vacationMoney
        .label
    ),
  });

  public async fillEmployeeInfo(
    firstName: string,
    lastName: string,
    ssn: string
  ): Promise<void> {
    await this.fillInput(this.firstName, firstName);
    await this.fillInput(this.lastName, lastName);
    await this.fillInput(this.ssn, ssn);
    await this.clickSelectRadioButton(this.isLivingInHelsinkiCheckbox);
  }

  public async fillPaidSubsidyGrant(): Promise<void> {
    await this.clickSelectRadioButton(this.paidSubsidyDefault);
    await this.clickSelectRadioButton(this.apprenticeshipProgramFalse);
  }

  public async fillBenefitPeriod(
    startDate: string,
    endDate: string
  ): Promise<void> {
    await this.fillInput(this.endDate, endDate);

    await this.fillInput(this.startDate, startDate);
  }

  public async fillEmploymentInfo(
    jobTitle: string,
    workingHours: string,
    collectiveBargainingAgreement: string,
    monthlyPay: string,
    otherExpenses: string,
    vacationMoney: string
  ): Promise<void> {
    await this.fillInput(this.jobTitle, jobTitle);
    await this.fillInput(this.workingHours, workingHours);
    await this.fillInput(
      this.collectiveBargainingAgreement,
      collectiveBargainingAgreement
    );
    await this.fillInput(this.monthlyPay, String(monthlyPay));
    await this.fillInput(this.vacationMoney, String(vacationMoney));
    await this.fillInput(this.otherExpenses, otherExpenses);
  }
}

export default Step2;
