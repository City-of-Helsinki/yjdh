import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class ActionBarReceived extends HandlerPageComponent {
  public constructor() {
    super({ datatestId: 'received-application-actions' });
  }

  handleButton(): SelectorPromise {
    return this.component.findByRole('button', {
      name: this.translations.review.actions.handle,
    });
  }

  closeButton(): SelectorPromise {
    return this.component.findByRole('button', {
      name: this.translations.review.actions.close,
    });
  }

  public async clickCloseButton(): Promise<void> {
    const button = await this.closeButton();
    return t.click(button);
  }

  public async clickHandleButton(): Promise<void> {
    const button = await this.handleButton();
    return t.click(button);
  }
}

export default ActionBarReceived;
