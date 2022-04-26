import { Selector, t } from 'testcafe';

import WizardStep from './WizardStep';

class Step3 extends WizardStep {
  constructor() {
    super(3);
  }

  employmentContract = Selector('input').withAttribute(
    'name',
    'employment_contract'
  );

  paySubsidyDecision = Selector('input').withAttribute(
    'name',
    'pay_subsidy_decision'
  );

  helsinkiBenefitVoucher = Selector('input').withAttribute(
    'name',
    'helsinki_benefit_voucher'
  );

  educationContract = Selector('input').withAttribute(
    'name',
    'education_contract'
  );

  deleteButton = Selector('button').withAttribute(
    'data-testid',
    'deleteButton'
  );

  confirmDeleteButton = Selector('button').withAttribute(
    'data-testid',
    'modalSubmit'
  );

  async employmentContractNeeded() {
    await t.expect(this.employmentContract.exists).ok();
  }

  async paySubsidyDecisionNeeded() {
    await t.expect(this.paySubsidyDecision.exists).ok();
  }

  async educationContractNeeded() {
    await t.expect(this.educationContract.exists).ok();
  }

  async helsinkiBenefitVoucherNeeded() {
    await t.expect(this.helsinkiBenefitVoucher.exists).ok();
  }

  async delete() {
    await t.click(this.deleteButton);
    await t.click(this.confirmDeleteButton);
  }
}

export default Step3;
