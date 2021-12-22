import { t, Selector } from 'testcafe';

class Step2 {
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

  async fillEmployeeInfo(
    firstName: string,
    lastName: string,
    ssn: string,
    phoneNumber: string
  ) {
    await t
      .typeText(this.firstName, firstName)
      .typeText(this.lastName, lastName)
      .typeText(this.ssn, ssn)
      .typeText(this.phoneNumber, phoneNumber)
      .click(this.isLivingInHelsinkiCheckbox);
  }

  async fillPaidSubsidyGrant() {
    await t
      .click(this.paidSubsidyTrue)
      .click(this.paidSubsidySelect)
      .click(this.paidSubsidyFiftyPercent)
      .click(this.additionalPaidSubsidySelect)
      .click(this.additionalPaidSubsidyThirtyPercent);
  }

  async selectBenefitType(benefitType: 'employment' | 'salary' | 'commission') {
    switch (benefitType) {
      case 'employment':
        await t.click(this.benefitTypeEmployment);
        break;
      case 'salary':
        await t.click(this.benefitTypeSalary);
        break;
      case 'commission':
        await t.click(this.benefitTypeCommission);
        break;
    }
  }

  async fillBenefitPeriod(startDate: string, endDate: string) {
    await t
      .typeText(this.startDate, startDate)
      .wait(500)
      .typeText(this.endDate, endDate);
  }

  async fillEmploymentInfo(
    jobTitle: string,
    workingHours: string,
    collectiveBargainingAgreement: string,
    monthlyPay: string,
    otherExpenses: string,
    vacationMoney: string
  ) {
    await t
      .typeText(this.jobTitle, jobTitle)
      .typeText(this.workingHours, workingHours)
      .typeText(
        this.collectiveBargainingAgreement,
        collectiveBargainingAgreement
      )
      .typeText(this.monthlyPay, monthlyPay)
      .typeText(this.otherExpenses, otherExpenses)
      .typeText(this.vacationMoney, vacationMoney);
  }

  async submit() {
    await t.click(this.nextButton);
  }
}

export default new Step2();
