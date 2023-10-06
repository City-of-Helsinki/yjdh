import { Selector, t } from 'testcafe';

import WizardStep from './WizardStep';

class Step6 extends WizardStep {
  constructor() {
    super(6);
  }

  protected nextButton = this.component.findByRole('button', {
    name: this.translations.applications.actions.send,
  });

  public submitSuccessLabel = this.component.findByText(
    this.translations.notifications.applicationSubmitted.label,
    { selector: 'h1' }
  );

  public async isShowingSubmitSuccess(): Promise<void> {
    await t
      .expect(
        await Selector('h1').withText(
          this.translations.notifications.applicationSubmitted.label
        ).visible
      )
      .ok();
  }

  public applicantTerms = this.component.findByTestId('');

  /**
   * Click through all applicant terms.
   * Assume terms are loaded from fixture default_terms.json using LOAD_DEFAULT_TERMS=1
   */
  public async checkApplicantTerms(): Promise<void> {
    const consentSelector = '[data-testid="application-terms-consent"]';
    await t.click(Selector(consentSelector).nth(0));
    await t.click(Selector(consentSelector).nth(1));
    await t.click(Selector(consentSelector).nth(2));
    await t.click(Selector(consentSelector).nth(3));
  }
}

export default Step6;
