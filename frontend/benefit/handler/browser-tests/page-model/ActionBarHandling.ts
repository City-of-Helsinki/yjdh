import { t } from 'testcafe';

import HandlerPageComponent from './HandlerPageComponent';

class ActionBarHandling extends HandlerPageComponent {
  public constructor() {
    super({ datatestId: 'handling-application-actions' });
  }

  panelButton(): SelectorPromise {
    return this.component.findByRole('button', {
      name: this.translations.review.actions.handlingPanel,
    });
  }

  saveAndContinueButton(): SelectorPromise {
    return this.component.findByRole('button', {
      name: this.translations.review.actions.saveAndContinue,
    });
  }

  public clickSaveAndContinueButton(): Promise<void> {
    return t.click(this.saveAndContinueButton());
  }

  public clickPanelButton(): Promise<void> {
    return t.click(this.panelButton());
  }
}

export default ActionBarHandling;
