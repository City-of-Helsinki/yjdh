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

  async employmentContractNeeded(): Promise<void> {
    await t.expect(this.employmentContract.exists).ok();
  }

  async paySubsidyDecisionNeeded(): Promise<void> {
    await t.expect(this.paySubsidyDecision.exists).ok();
  }

  async helsinkiBenefitVoucherNeeded(): Promise<void> {
    await t.expect(this.helsinkiBenefitVoucher.exists).ok();
  }

  async educationContractNeeded(): Promise<void> {
    await t.expect(this.educationContract.exists).ok();
  }

  async stageUploadFiles(filename: string, uploadIds: string[]): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of uploadIds) {
      const filenameWithoutExtension = filename.replace(/\.\w+$/, '');

      // eslint-disable-next-line no-await-in-loop
      await t.setFilesToUpload(id, filename);

      // eslint-disable-next-line no-await-in-loop
      await t
        .expect(
          Selector(id)
            .parent()
            .parent()
            .find(`a[aria-label^="${filenameWithoutExtension}"]`).visible
        )
        .ok();
    }
  }
}

export default Step3;
