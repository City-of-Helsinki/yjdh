import { Selector, t } from 'testcafe';

import WizardStep from './WizardStep';

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const submitSuccessLabels = new RegExp(
      `${escapeRegex(
        this.translations.notifications.applicationSubmitted.label
      )}|${escapeRegex(
        this.translations.notifications.applicationReSubmitted.label
      )}`
    );

    await t
      .expect(Selector('h1').withText(submitSuccessLabels).visible)
      .ok({ timeout: 30_000 });
  }

  public applicantTerms = this.component.findByTestId('');

  /**
   * Click through all applicant terms.
   * Assume terms are loaded from fixture default_terms.json using LOAD_DEFAULT_TERMS=1
   */
  public async checkApplicantTerms(): Promise<void> {
    const consentSelector = '[data-testid="application-terms-consent"]';
    const consents = Selector(consentSelector);
    const consentCount = await consents.count;

    for (let i = 0; i < consentCount; i++) {
      await t.click(consents.nth(i));
    }
  }
}

export default Step6;
