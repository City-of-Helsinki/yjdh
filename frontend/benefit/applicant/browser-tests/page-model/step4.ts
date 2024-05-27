import { Selector, t } from 'testcafe';

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
  async stageUploadFiles(filename: string): Promise<void> {
    const filenameWithoutExtension = filename.replace(/\.\w+$/, '');
    await t.setFilesToUpload('#upload_attachment_employee_consent', filename);
    await t
      .expect(Selector(`a[aria-label^="${filenameWithoutExtension}"]`).visible)
      .ok();
  }
}

export default Step4;
