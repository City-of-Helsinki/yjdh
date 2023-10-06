import { Selector, t } from 'testcafe';

import { ApplicationFormData } from '../types';
import {
  ApplicationField,
  mapFullForm as mapFieldsExtra,
  mapRequiredForm as mapFieldsMandatory,
} from '../utils/fieldMaps';
import WizardStep from './WizardStep';

class Step5 extends WizardStep {
  private fieldsRequired: ApplicationField[];

  private fieldsExtra: ApplicationField[];

  private Selector = Selector;

  constructor(form: ApplicationFormData) {
    super(5);

    this.fieldsRequired = mapFieldsMandatory(form);
    this.fieldsExtra = mapFieldsExtra(form);
  }

  private associationFieldNames = [
    'application-field-associationImmediateManagerCheck',
  ];

  private fieldIsVisible = async (testId: string): Promise<boolean> =>
    this.component.findByTestId(testId).visible;

  private fieldValueIsVisible = async (
    testId: string,
    value: string
  ): Promise<boolean> =>
    this.Selector(`[data-testid="${testId}"]`).withText(value).visible;

  async fieldsExistFor(
    organizationType: 'company' | 'association'
  ): Promise<void> {
    const fullForm = [...this.fieldsRequired, ...this.fieldsExtra];
    // eslint-disable-next-line no-restricted-syntax
    for (const field of fullForm) {
      // eslint-disable-next-line no-await-in-loop
      await t.scrollIntoView(`[data-testid="${field.testId}"]`);
      // eslint-disable-next-line no-await-in-loop
      await t.expect(await this.fieldIsVisible(field.testId)).ok();
      if (field.value) {
        // eslint-disable-next-line no-await-in-loop
        const fieldIsVisible = await this.fieldValueIsVisible(
          field.testId,
          field.value
        );
        // eslint-disable-next-line no-await-in-loop
        await t.expect(fieldIsVisible).ok();
      }
    }

    if (organizationType === 'association') {
      // eslint-disable-next-line no-restricted-syntax
      for (const testId of this.associationFieldNames) {
        // eslint-disable-next-line no-await-in-loop
        await t.expect(await this.fieldIsVisible(testId)).ok();
      }
    }
  }
}

export default Step5;
