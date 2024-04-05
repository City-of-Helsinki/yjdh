import { t } from 'testcafe';

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

  private apprenticeshipProgramTrue = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.employee.fields
          .apprenticeshipProgram.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.employee.fields
      .apprenticeshipProgram.yes,
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
    await t.typeText(this.firstName, firstName);
    await t.typeText(this.lastName, lastName);
    await t.typeText(this.ssn, ssn);
    await this.clickSelectRadioButton(this.isLivingInHelsinkiCheckbox);
  }

  public async fillPaidSubsidyGrant(
    apprenticeshipProgram: boolean
  ): Promise<void> {
    await this.clickSelectRadioButton(this.paidSubsidyDefault);
    if (apprenticeshipProgram) {
      await this.clickSelectRadioButton(this.apprenticeshipProgramTrue);
      return;
    }
    await this.clickSelectRadioButton(this.apprenticeshipProgramFalse);
  }

  public async fillBenefitPeriod(
    startDate: string,
    endDate: string
  ): Promise<void> {
    await t.typeText(this.endDate, endDate);

    await t.typeText(this.startDate, startDate);
  }

  public async fillEmploymentInfo(
    jobTitle: string,
    workingHours: string,
    collectiveBargainingAgreement: string,
    monthlyPay: string,
    otherExpenses: string,
    vacationMoney: string
  ): Promise<void> {
    await t.typeText(this.jobTitle, jobTitle);
    await t.typeText(this.workingHours, workingHours);
    await t.typeText(
      this.collectiveBargainingAgreement,
      collectiveBargainingAgreement
    );
    await t.typeText(this.monthlyPay, String(monthlyPay));
    await t.typeText(this.vacationMoney, String(vacationMoney));
    await t.typeText(this.otherExpenses, otherExpenses);
  }
}

export default Step2;
