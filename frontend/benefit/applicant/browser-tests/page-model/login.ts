import { t, Selector } from 'testcafe';

class Login {
  loginButton = Selector('button').withAttribute('data-testid', 'loginButton');
  loginOptionButton = Selector('#valinta__vaihtoehto__vetupas2');
  defaultSSN = Selector('#hetu_default');
  authenticateButton = Selector('#tunnistaudu');
  continueButton = Selector('#continue-button');
  companyRadioButton = Selector('label').withText('YTM - Industrial Oy');
  submitButton = Selector('button')
    .withAttribute('type', 'submit')
    .withText('Valitse ja siirry asiointipalveluun');

  async clickSubmit() {
    await t.click(this.submitButton);
  }

  async typeName(name: string) {
    await t.typeText(this.loginButton, name);
  }
}

export default new Login();
