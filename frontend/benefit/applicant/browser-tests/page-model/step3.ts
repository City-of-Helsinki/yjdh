import { Selector, t } from 'testcafe';

import WizardStep from './WizardStep';

class Step3 extends WizardStep {
  constructor() {
    super(3);
  }

  private employmentContract = this.component.findByTestId(
    'employment_contract'
  );
  private paySubsidyDecision = this.component.findByTestId(
    'pay_subsidy_decision'
  );
  private helsinkiBenefitVoucher = this.component.findByTestId(
    'helsinki_benefit_voucher'
  );
  private educationContract = this.component.findByTestId('education_contract');

  async employmentContractNeeded() {
    await t.expect(this.employmentContract.exists).ok();
  }

  async paySubsidyDecisionNeeded() {
    await t.expect(this.paySubsidyDecision.exists).ok();
  }

  async helsinkiBenefitVoucherNeeded() {
    await t.expect(this.helsinkiBenefitVoucher.exists).ok();
  }

  async educationContractNeeded() {
    await t.expect(this.educationContract.exists).ok();
  }
}

export default Step3;
