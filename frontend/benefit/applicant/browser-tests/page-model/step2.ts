import { t } from 'testcafe';

import WizardStep from './WizardStep';

class Step2 extends WizardStep {
  constructor() {
    super(2);
  }

  firstName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.firstName.label
    ),
  });
  lastName = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.lastName.label
    ),
  });
  ssn = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .socialSecurityNumber.label
    ),
  });
  phoneNumber = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.phoneNumber.label
    ),
  });

  isLivingInHelsinkiCheckbox = this.component.findByRole('checkbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.isLivingInHelsinki
        .placeholder
    ),
  });

  paidSubsidyTrue = this.within(
    this.component.getByRole('group', {
      name: this.regexp(
        this.translations.applications.sections.employee.fields
          .paySubsidyGranted.label
      ),
    })
  ).findByRole('radio', {
    name: this.translations.applications.sections.employee.fields
      .paySubsidyGranted.yes,
  });

  paidSubsidySelect = this.component.findByRole('button', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.paySubsidyPercent
        .label
    ),
  });
  fiftyPercent = this.component.findByRole('option', {
    name: '50%',
  });

  additionalPaidSubsidySelect = this.component.findByRole('button', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .additionalPaySubsidyPercent.label
    ),
  });
  thirtyPercent = this.component.findByRole('option', {
    name: '50%',
  });

  apprenticeshipProgramFalse = this.within(
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

  benefitTypeEmployment = this.component.findByRole('radio', {
    name: this.translations.applications.sections.employee.fields.benefitType
      .employment,
  });
  benefitTypeSalary = this.component.findByRole('radio', {
    name: this.translations.applications.sections.employee.fields.benefitType
      .salary,
  });
  benefitTypeCommission = this.component.findByRole('radio', {
    name: this.translations.applications.sections.employee.fields.benefitType
      .commission,
  });

  startDate = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.startDate.label
    ),
  });
  endDate = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.endDate.label
    ),
  });

  jobTitle = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.jobTitle.label
    ),
  });
  workingHours = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.workingHours.label
    ),
  });
  collectiveBargainingAgreement = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields
        .collectiveBargainingAgreement.label
    ),
  });

  monthlyPay = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.monthlyPay.label
    ),
  });
  otherExpenses = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.otherExpenses
        .label
    ),
  });
  vacationMoney = this.component.findByRole('textbox', {
    name: this.regexp(
      this.translations.applications.sections.employee.fields.vacationMoney
        .label
    ),
  });

  public async fillEmployeeInfo(
    firstName: string,
    lastName: string,
    ssn: string,
    phoneNumber: string
  ): Promise<void> {
    await Step2.fillInput(this.firstName, firstName);
    await Step2.fillInput(this.lastName, lastName);
    await Step2.fillInput(this.ssn, ssn);
    await Step2.fillInput(this.phoneNumber, phoneNumber);
    await Step2.clickSelectRadioButton(this.isLivingInHelsinkiCheckbox);
  }

  public async fillPaidSubsidyGrant(): Promise<void> {
    await Step2.clickSelectRadioButton(this.paidSubsidyTrue);
    await t.click(this.paidSubsidySelect);
    await t.click(this.fiftyPercent);
    await t.click(this.additionalPaidSubsidySelect);
    await t.click(this.thirtyPercent);
    await Step2.clickSelectRadioButton(this.apprenticeshipProgramFalse);
  }

  public async selectBenefitType(
    benefitType: 'employment' | 'salary' | 'commission'
  ): Promise<void> {
    switch (benefitType) {
      case 'employment':
        await Step2.clickSelectRadioButton(this.benefitTypeEmployment);
        break;
      case 'salary':
        await Step2.clickSelectRadioButton(this.benefitTypeSalary);
        break;
      case 'commission':
      default:
        await Step2.clickSelectRadioButton(this.benefitTypeCommission);
        break;
    }
  }

  public async fillBenefitPeriod(
    startDate: string,
    endDate: string
  ): Promise<void> {
    await Step2.fillInput(this.startDate, startDate);
    await Step2.fillInput(this.endDate, endDate);
  }

  public async fillEmploymentInfo(
    jobTitle: string,
    workingHours: string,
    collectiveBargainingAgreement: string,
    monthlyPay: string,
    otherExpenses: string,
    vacationMoney: string
  ) {
    await Step2.fillInput(this.jobTitle, jobTitle);
    await Step2.fillInput(this.workingHours, workingHours);
    await Step2.fillInput(
      this.collectiveBargainingAgreement,
      collectiveBargainingAgreement
    );
    await Step2.fillInput(this.monthlyPay, monthlyPay);
    await Step2.fillInput(this.otherExpenses, otherExpenses);
    await Step2.fillInput(this.vacationMoney, vacationMoney);
  }
}

export default Step2;
