import { t } from 'testcafe';

import ApplicantPageComponent from './ApplicantPageComponent';
import { Options } from '@frontend/shared/browser-tests/page-models/PageComponent';

class WizardStep extends ApplicantPageComponent {
  constructor(
    step: 1 | 2 | 3 | 4 | 5 | 6,
    options?: Omit<Options, 'datatestId'>
  ) {
    super({ datatestId: `step-${step}`, ...options });
  }

  nextButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.continue,
  });
  saveAndCloseButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.continue,
  });

  public async clickSubmit() {
    await t.click(this.nextButton);
  }
  public async clickSaveAndClose() {
    await t.click(this.saveAndCloseButton);
  }
}

export default WizardStep;
