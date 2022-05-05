import AdditionalInfoApplication from '@frontend/kesaseteli-shared/src/types/additional-info-application';
import AdditionalInfoReasonType from '@frontend/kesaseteli-shared/src/types/additional-info-reason-type';
import { t } from 'testcafe';

import YouthTranslations from '../../src/__tests__/utils/i18n/youth-translations';
import YouthPageComponent from './YouthPageComponent';
import { Language } from '@frontend/shared/src/i18n/i18n';

type NotificationType =
  keyof YouthTranslations['additionalInfo']['notification'];
type Reason = keyof YouthTranslations['additionalInfo']['reasons'];
class AdditionalInfoPage extends YouthPageComponent {
  public constructor(lang?: Language) {
    super({ lang, datatestId: 'additional-info' });
  }

  private withinForm = this.within(
    this.component.getByTestId('additional-info-form')
  );

  private title = this.component.findByRole('heading', {
    name: this.translations.additionalInfo.title,
  });

  private reasonOption(reason: Reason) {
    return this.withinForm.findByRole('option', {
      name: this.regexp(this.translations.additionalInfo.reasons[reason]),
    });
  }

  private additionalInfoDescription = this.withinForm.findByRole('textbox', {
    name: this.regexp(
      this.translations.additionalInfo.form.additional_info_description
    ),
  });

  private sendButton = this.withinForm.findByRole('button', {
    name: this.regexp(this.translations.additionalInfo.form.sendButton),
  });

  private notification(type: NotificationType) {
    return this.component.findByRole('heading', {
      name: this.regexp(this.translations.additionalInfo.notification[type]),
    });
  }

  public async isLoaded(): Promise<void> {
    await super.isLoaded();
    return this.expect(this.title);
  }

  public showsNotification(type: NotificationType) {
    return this.expect(this.notification(type));
  }

  public async clickAndSelectReasonsFromDropdown(
    reasons: AdditionalInfoReasonType[]
  ) {
    await this.htmlElementClick('#additional_info_user_reasons-toggle-button');
    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line no-restricted-syntax
    for (const reason of reasons) {
      await t.click(this.reasonOption(reason));
    }
    /* eslint-enable no-await-in-loop */
    await this.htmlElementClick('#additional_info_user_reasons-toggle-button');
  }

  public async typeAdditionalInfoDescription(text: string) {
    await this.fillInput(this.additionalInfoDescription, text);
  }

  public async clickSendButton() {
    await t.click(this.sendButton);
  }

  public async sendAdditionalInfoApplication(
    application: AdditionalInfoApplication
  ) {
    await this.isLoaded();
    await this.clickAndSelectReasonsFromDropdown(
      application.additional_info_user_reasons
    );
    await this.typeAdditionalInfoDescription(
      application.additional_info_description
    );
    await this.clickSendButton();
    await this.showsNotification('sent');
  }
}

export default AdditionalInfoPage;
