import { t } from 'testcafe';
import HandlerPageComponent from './HandlerPageComponent';

class ApplicationList extends HandlerPageComponent {
  public constructor(status: Array<string>) {
    super({ datatestId: `application-list-${status.join(',')}` });
  }

  private getListedItemLink(name: string): SelectorPromise {
    return this.component.findByText(name);
  }

  async clickListedItemLink(name: string): Promise<void> {
    const link = await this.getListedItemLink(name);
    return t.click(link);
  }

  async hasItemsListed(countExpected = 1): Promise<void> {
    const rows = this.component.findAllByRole('row');
    const countMinusHeader = (await rows.count) - 1;
    return t.expect(countMinusHeader).eql(countExpected);
  }
}

export default ApplicationList;
