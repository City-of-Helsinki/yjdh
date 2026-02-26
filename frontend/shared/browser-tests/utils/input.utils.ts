import TestController, { Selector } from 'testcafe';

import { setDataToPrintOnFailure } from './testcafe.utils';

/**
 * Fills an input field with a value.
 * @param t Test controller
 * @param field Field name
 * @param inputSelector Input selector
 * @param value Value to fill
 * @param skipIfFilled Skip if already filled. True by default.
 * @returns Promise
 */
export const fillInput = async <T>(
  t: TestController,
  field: keyof T,
  inputSelector: ReturnType<Selector>,
  value?: string,
  skipIfFilled = true
): Promise<void> => {
  setDataToPrintOnFailure(t, String(field), value);

  if (skipIfFilled) {
    const currentValue = await inputSelector.value;
    // If the expected value is an empty string (or undefined) and the field is already empty,
    // or if the field already contains the exact string we want to type, we can safely skip the UI interaction.
    // This provides a massive speedup for pre-filled forms (e.g. loaded drafts).
    if (currentValue === (value ?? '')) {
      return;
    }
  }

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
