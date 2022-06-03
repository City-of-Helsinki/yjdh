import { Selector, t } from 'testcafe';

class Postingpage {
  postingTitle = Selector('#postingTitle');

  // TODO why is this not found?
  backButton = Selector('#backButton');

  goBack = () => t.click(this.backButton);
}

export default new Postingpage();
