import { WithinSelectors } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import {
  containsRegexp,
  replaceValues,
} from '../../src/__tests__/utils/translation-utils';
import { MAIN_CONTENT_ID } from '../../src/constants';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

abstract class PageComponent {
  private readonly componentSelector: Selector;

  protected readonly component: WithinSelectors;

  protected screen = screenContext(t);

  protected within = withinContext(t);

  protected regexp = containsRegexp;

  protected replaced = replaceValues;

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
    return (
      t
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        .expect(this.componentSelector.exists)
        .ok(await getErrorMessage(t), { timeout })
    );
  }

  /**
   * Utility that clears the possible previous value from input and
   * types a new one
   * @param selector
   * @param value
   * @protected
   */
  protected static fillInput(
    selector: Selector | SelectorPromise,
    value?: string
  ): Promise<void> {
    return t
      .click(selector)
      .pressKey('ctrl+a delete')
      .typeText(selector, value ?? '');
  }

  /**
   * Utility to click radio button without waiting timeout
   * https://stackoverflow.com/questions/66246885/slow-performance-with-testcafe-and-ids-and-custom-radio-buttons
   */
  protected static clickSelectRadioButton(
    selector: Selector | SelectorPromise
  ): Promise<void> {
    return t.click(Selector(selector, { timeout: 0 }));
  }
}

export default PageComponent;
