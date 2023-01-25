import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class ApplicationList extends HandlerPageComponent {
  public constructor(status: string) {
    super({ datatestId: `application-list-${status}` });
  }

  private getListedItems = (): SelectorPromise => {
    return this.component.findAllByRole('row');
  };

  getListedItemLink(name: string): SelectorPromise {
    return this.component.findByText(name);
  }

  async hasItemsListed() {
    const items = this.getListedItems();
    const count = (await items.count) - 1;
    return t.expect(count).gte(1);
  }
}

export default ApplicationList;
