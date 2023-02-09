import { Selector, t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class MainIngress extends HandlerPageComponent {
  private selector;
  private text;

  public constructor(text: string, selector: string) {
    super({ datatestId: 'main-ingress' });
    this.text = text;
    this.selector = selector;
  }

  public async isVisible(): Promise<void> {
    await this.isLoaded();
    const heading = this.component.findByText(this.text, {
      selector: this.selector,
    });
    const isElementVisible = await heading.visible;
    return t.expect(isElementVisible).ok();
  }
}

export default MainIngress;
