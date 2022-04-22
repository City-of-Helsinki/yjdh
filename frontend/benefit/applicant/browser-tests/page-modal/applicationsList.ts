import { Selector, t } from 'testcafe';

class ApplicationsList {
  newApplicationButton = Selector('button').withAttribute(
    'data-testid',
    'newApplicationButton'
  );

  async createNewApplication(): Promise<void> {
    await t.click(this.newApplicationButton);
  }
}

export default new ApplicationsList();
