import YouthPageComponent from './YouthPageComponent';
import YouthTranslations from '../../src/__tests__/utils/i18n/youth-translations';

type NotificationType = keyof YouthTranslations['notificationPages'];
import { t } from 'testcafe';
import { Language } from '@frontend/shared/src/i18n/i18n';

class NotificationPage extends YouthPageComponent {
  private readonly type: NotificationType;

  public constructor(type: NotificationType, lang?: Language) {
    super({ lang });
    this.type = type;
  }

  private header() {
    return this.component.findByRole('heading', {
      name: this.translations.notificationPages[this.type].title,
    });
  }

  private goToFrontPageButton() {
    return this.component.findByRole('button', {
      name: this.translations.notificationPages[this.type].goToFrontendPage,
    });
  }

  public async isLoaded(): Promise<void> {
    await super.isLoaded();
    return this.expect(this.header());
  }

  public async clickGoToFrontPageButton() {
    return t.click(this.goToFrontPageButton());
  }
}

export default NotificationPage;
