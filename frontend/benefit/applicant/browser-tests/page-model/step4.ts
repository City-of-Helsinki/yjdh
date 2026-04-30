import { t } from 'testcafe';

import WizardStep from './WizardStep';
import { getUploadedFileLinkInScope } from '../utils/attachmentSelectors';

class Step4 extends WizardStep {
  constructor() {
    super(4);
  }

  private employeeConsent = this.component.findByTestId('employee_consent');

  async employeeConsentNeeded(): Promise<void> {
    await t.expect(this.employeeConsent.exists).ok();
  }

  async stageUploadFiles(filename: string): Promise<void> {
    const uploadedFileLink = getUploadedFileLinkInScope(
      '[data-testid="step-4"]',
      filename
    );

    const inputId = '#upload_attachment_employee_consent';

    await t.setFilesToUpload(inputId, filename);
    await t
      .expect(uploadedFileLink.exists)
      .ok('Uploaded file link should become visible', {
        timeout: 15_000,
      });
  }
}

export default Step4;
