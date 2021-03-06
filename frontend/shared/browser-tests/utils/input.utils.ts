import TestController, { Selector } from 'testcafe';

import { setDataToPrintOnFailure } from './testcafe.utils';

export const fillInput = async <T>(
  t: TestController,
  field: keyof T,
  inputSelector: ReturnType<Selector>,
  value?: string
): Promise<void> => {
  setDataToPrintOnFailure(t, String(field), value);
  await t
    .click(inputSelector)
    .pressKey('ctrl+a delete')
    .typeText(inputSelector, value ?? '');
};

/**
 * Utility to click radio button without waiting timeout
 * https://stackoverflow.com/questions/66246885/slow-performance-with-testcafe-and-ids-and-custom-radio-buttons
 */
export const clickSelectRadioButton = (
  t: TestController,
  selector: Selector | SelectorPromise
): Promise<void> => t.click(Selector(selector, { timeout: 0 }));
