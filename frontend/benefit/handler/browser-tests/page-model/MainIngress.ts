import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class MainIngress extends HandlerPageComponent {
  public constructor() {
    super({ datatestId: 'main-ingress' });
  }

  public async hasHeading(
    text: string,
    selector = 'h1'
  ): Promise<NodeSnapshot> {
    return this.component.findByText(text, { selector });
  }
}

export default MainIngress;
