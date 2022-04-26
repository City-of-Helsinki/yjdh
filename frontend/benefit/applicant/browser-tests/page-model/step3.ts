import { t, Selector } from 'testcafe';

class Step3 {
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

  nextButton = Selector('button').withAttribute('data-testid', 'nextButton');

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

  async submit() {
    await t.click(this.nextButton);
  }

  async delete() {
    await t.click(this.deleteButton);
    await t.click(this.confirmDeleteButton);
  }
}

export default new Step3();
