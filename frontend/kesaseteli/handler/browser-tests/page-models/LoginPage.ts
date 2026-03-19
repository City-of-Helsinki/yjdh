import PageComponent from '@frontend/shared/browser-tests/page-models/PageComponent';
import { t } from 'testcafe';

export default class LoginPage extends PageComponent {
  public constructor() {
    super('login-page');
  }

  public async isLoaded(): Promise<void> {
    await super.isLoaded();
    return this.expect(this.loginButton);
  }

  private loginButton = this.component.findByRole('button', {
    name: /kirjaudu palveluun/i,
  });

  public async clickLoginButton(): Promise<void> {
    return t.click(this.loginButton);
  }

  public async expectSessionExpiredMessage(): Promise<void> {
    return this.expect(this.component.findByText(/käyttäjäsessio vanhentui/i));
  }
}
