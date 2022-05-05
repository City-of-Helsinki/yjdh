import { WithinSelectors } from '@testing-library/testcafe';
import { ClientFunction, Selector, t } from 'testcafe';

import {
  containsRegexp,
  replaceValues,
} from '../../src/__tests__/utils/translation-utils';
import { MAIN_CONTENT_ID } from '../../src/constants';
import { Language } from '../../src/i18n/i18n';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

export type Options = {
  datatestId?: string;
  lang?: Language;
  selector?: Selector;
};

abstract class PageComponent {
  private readonly componentSelector: Selector;

  protected readonly component: WithinSelectors;

  protected screen = screenContext(t);

  protected within = withinContext(t);

  protected regexp = containsRegexp;

  protected replaced = replaceValues;

  /**
   * Enforce click html element when t.click doesn't work
   * https://github.com/DevExpress/testcafe/issues/4146#issuecomment-521216775
   * @param cssSelector
   */
  protected htmlElementClick = ClientFunction(
    // eslint-disable-next-line unicorn/consistent-function-scoping
    (cssSelector: string) =>
      document.querySelector<HTMLElement>(cssSelector)?.click()
  );

  protected constructor(datatestId?: string) {
    this.componentSelector = this.screen.findByTestId(
      datatestId ?? MAIN_CONTENT_ID
    );
    this.component = this.within(this.componentSelector);
  }

  loadingSpinners = this.screen.findAllByTestId('hidden-loading-indicator');

  public async isLoadingSpinnerNoMorePresent(timeout?: number): Promise<void> {
    return (
      t
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        .expect(this.loadingSpinners.exists)
        .notOk(await getErrorMessage(t), { timeout })
    );
  }

  /**
   * Waits until component is loaded to the screen. Please call this instantly after
   * calling the constructor to make sure the component is present before proceeding with other actions
   */
  public async isLoaded(timeout?: number): Promise<void> {
    await this.isLoadingSpinnerNoMorePresent(timeout);
    return this.expect(this.componentSelector);
  }

  /** expectation utility */
  /* eslint-disable class-methods-use-this */
  protected async expect(
    selector: Selector | SelectorPromise,
    timeout?: number
  ): Promise<void> {
    return (
      t
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        .expect(selector.exists)
        .ok(await getErrorMessage(t), { timeout })
    );
  }

  protected async expectNotPresent(
    selector: Selector | SelectorPromise,
    timeout?: number
  ): Promise<void> {
    return (
      t
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        .expect(selector.exists)
        .notOk(await getErrorMessage(t), { timeout })
    );
  }

  /**
   * Utility that clears the possible previous value from input and
   * types a new one
   */
  protected fillInput(
    selector: Selector | SelectorPromise,
    value?: string
  ): TestControllerPromise {
    return t
      .click(selector)
      .pressKey('ctrl+a delete')
      .typeText(selector, value ?? '');
  }

  /**
   * Utility to click radio button without waiting timeout
   * https://stackoverflow.com/questions/66246885/slow-performance-with-testcafe-and-ids-and-custom-radio-buttons
   */
  protected clickSelectRadioButton(
    selector: Selector | SelectorPromise
  ): TestControllerPromise {
    return t.click(Selector(selector, { timeout: 0 }));
  }
  /* eslint-enable class-methods-use-this */
}

export default PageComponent;
