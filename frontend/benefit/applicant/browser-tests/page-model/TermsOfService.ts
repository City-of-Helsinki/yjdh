import { t } from 'testcafe';

import ApplicantPageComponent from './ApplicantPageComponent';

class TermsOfService extends ApplicantPageComponent {
  public constructor() {
    super({ datatestId: 'terms-of-service' });
  }

  continueButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.continueToService,
  });

  public async clickContinueButton(): Promise<void> {
    return t.click(this.continueButton);
  }
}

export default TermsOfService;
