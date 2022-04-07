import { t, Selector } from 'testcafe';

class Frontpage {
  quickSearchInput = Selector('#searchText');

  submitButton = Selector('button').withText('Hae');

  fillSearch = (query: string) => t.typeText(this.quickSearchInput, query);

  search = () => t.click(this.submitButton);
}

export default new Frontpage();
