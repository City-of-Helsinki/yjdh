import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class ApplicationListForInstalments extends HandlerPageComponent {
  public constructor(status: Array<string>) {
    super({ datatestId: `application-list-${status.join(',')}` });
  }

  async hasDateChangeButton(): Promise<void> {
    const checkbox = this.component.findByRole('checkbox');
    await t.click(checkbox);
    const button = this.component.findByRole('button', {
      name: 'Muuta eräpäivää',
    });
    return t.expect(button.exists).ok();
  }
}

export default ApplicationListForInstalments;
