import { t, Selector } from 'testcafe';
import ApplicantPageComponent from './ApplicantPageComponent';

class Step2 extends ApplicantPageComponent {
  constructor() {
    super({ datatestId: 'step-2' });
  }

  currentStep = Selector('div')
    .withAttribute('data-testid', 'currentStep')
    .withText('2');

  firstName = Selector('input').withAttribute('name', 'employee.firstName');
  lastName = Selector('input').withAttribute('name', 'employee.lastName');
  ssn = Selector('input').withAttribute(
    'name',
    'employee.socialSecurityNumber'
  );
  phoneNumber = Selector('input').withAttribute('name', 'employee.phoneNumber');
  isLivingInHelsinkiCheckbox = Selector('input').withAttribute(
    'name',
    'employee.isLivingInHelsinki'
  );

  nextButton = Selector('button').withAttribute('data-testid', 'nextButton');

  paidSubsidyTrue = Selector('#paySubsidyGrantedTrue');
  paidSubsidySelect = Selector('#paySubsidyPercent-toggle-button');
  paidSubsidyFiftyPercent = Selector('#paySubsidyPercent-menu li').withText(
    '50%'
  );

  additionalPaidSubsidySelect = Selector(
    '#additionalPaySubsidyPercent-toggle-button'
  );
  additionalPaidSubsidyThirtyPercent = Selector(
    '#additionalPaySubsidyPercent-menu li'
  ).withText('30%');

  apprenticeshipProgramFalse = Selector('#apprenticeshipProgramFalse');

  benefitTypeEmployment = Selector('#benefitTypeEmployment');
  benefitTypeSalary = Selector('#benefitTypeSalary');
  benefitTypeCommission = Selector('#benefitTypeCommission');

  startDate = Selector('input').withAttribute('name', 'startDate');
  endDate = Selector('input').withAttribute('name', 'endDate');

  jobTitle = Selector('input').withAttribute('name', 'employee.jobTitle');
  workingHours = Selector('input').withAttribute(
    'name',
    'employee.workingHours'
  );
  collectiveBargainingAgreement = Selector('input').withAttribute(
    'name',
    'employee.collectiveBargainingAgreement'
  );
  monthlyPay = Selector('input').withAttribute('name', 'employee.monthlyPay');
  otherExpenses = Selector('input').withAttribute(
    'name',
    'employee.otherExpenses'
  );
  vacationMoney = Selector('input').withAttribute(
    'name',
    'employee.vacationMoney'
  );

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
    await Step2.clickSelectRadioButton(this.paidSubsidySelect);
    await Step2.clickSelectRadioButton(this.paidSubsidyFiftyPercent);
    await Step2.clickSelectRadioButton(this.additionalPaidSubsidySelect);
    await Step2.clickSelectRadioButton(this.additionalPaidSubsidyThirtyPercent);
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

  async submit() {
    await t.click(this.nextButton);
  }
}

export default Step2;
