import { setDataToPrintOnFailure } from '@frontend/shared/browser-tests/utils/testcafe.utils';
import ApplicationFieldName from '@frontend/shared/src/types/application-field-name';
import TestController, { Selector } from 'testcafe';

export const fillInput = async (
  t: TestController,
  field: ApplicationFieldName,
  inputSelector: ReturnType<Selector>,
  value?: string
): Promise<void> => {
  setDataToPrintOnFailure(t, String(field), value);
  await t
    .click(inputSelector)
    .pressKey('ctrl+a delete')
    .typeText(inputSelector, value ?? '');
};
