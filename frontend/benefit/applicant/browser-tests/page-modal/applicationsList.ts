import { t, Selector } from 'testcafe';

class ApplicationsList {
  newApplicationButton = Selector('button').withAttribute(
    'data-testid',
    'newApplicationButton'
  );

  async createNewApplication() {
    await t.click(this.newApplicationButton);
  }
}

export default new ApplicationsList();
