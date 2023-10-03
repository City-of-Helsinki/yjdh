import { Options } from '@frontend/shared/browser-tests/page-models/PageComponent';
import { t } from 'testcafe';

import ApplicantPageComponent from './ApplicantPageComponent';

class WizardStep extends ApplicantPageComponent {
  constructor(
    step: 1 | 2 | 3 | 4 | 5 | 6,
    options?: Omit<Options, 'datatestId'>
  ) {
    super({ datatestId: `step-${step}`, ...options });
  }

  protected nextButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.continue,
  });

  protected previousButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.back,
  });

  protected saveAndCloseButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.saveAndContinueLater,
  });

  protected deleteButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.deleteApplication,
  });

  protected dialogConfirmDeleteButton = this.within(
    this.screen.getByRole('dialog')
  ).findByRole('button', {
    name: this.translations.applications.actions.deleteApplication,
  });

  public clickSubmit(): Promise<void> {
    return t.click(this.nextButton);
  }

  public expectSaveAndClose(): Promise<void> {
    return t.expect(this.nextButton).notOk();
  }

  public expectSubmitDisabled(): Promise<void> {
    return t.expect(this.nextButton.hasAttribute('disabled')).ok();
  }

  public clickPrevious(): Promise<void> {
    return t.click(this.previousButton);
  }

  public clickSaveAndClose(): Promise<void> {
    return t.click(this.saveAndCloseButton);
  }

  public async clickDeleteApplication(): Promise<void> {
    return t.click(this.deleteButton);
  }

  public confirmDeleteApplication(): Promise<void> {
    return t.click(this.dialogConfirmDeleteButton);
  }
}

export default WizardStep;
