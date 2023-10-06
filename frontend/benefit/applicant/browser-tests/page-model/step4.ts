import { t } from 'testcafe';

import WizardStep from './WizardStep';

class Step4 extends WizardStep {
  constructor() {
    super(4);
  }

  private employeeConsent = this.component.findByTestId('employee_consent');

  async employeeConsentNeeded(): Promise<void> {
    await t.expect(this.employeeConsent.exists).ok();
  }

  // eslint-disable-next-line class-methods-use-this
  async stageUploadFiles(): Promise<void> {
    await t.setFilesToUpload(
      '#upload_attachment_employee_consent',
      'sample.pdf'
    );
    await t.wait(500);
  }
}

export default Step4;
