import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class ApplicationReview extends HandlerPageComponent {
  public constructor() {
    super({ datatestId: 'application-body' });
  }

  public async hasHeading(
    text: string,
    selector = 'h1'
  ): Promise<NodeSnapshot> {
    await this.isLoaded();
    const heading = this.component.findByText(text, { selector });
    return t.expect(heading.textContent).eql(text);
  }
}

export default ApplicationReview;
