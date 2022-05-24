import { setDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { getUrlParam } from '@frontend/shared/browser-tests/utils/url.utils';
import { Language } from '@frontend/shared/src/i18n/i18n';
import { t } from 'testcafe';

import NotificationPage from './NotificationPage';

class ThankYouPage extends NotificationPage {
  public constructor(lang?: Language) {
    super('thankyou', lang);
  }

  private activationLink = this.component.findByRole('link', {
    name: /aktivoi/i,
  });

  public async clickActivationLink(): Promise<string> {
    const applicationId = await getUrlParam('id');
    if (!applicationId) {
      throw new Error('cannot complete test without application id');
    }
    const href = await this.activationLink.getAttribute('href');
    setDataToPrintOnFailure(t, 'activationLink', href);
    // eslint-disable-next-line no-console
    console.log('Clicking activation link', href);
    await t.click(this.activationLink);
    return applicationId;
  }
}

export default ThankYouPage;
