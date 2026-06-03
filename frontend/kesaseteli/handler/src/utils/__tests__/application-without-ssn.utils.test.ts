import { TFunction } from 'next-i18next';

import { getApplicationWithoutSsnFormFieldLabel } from '../application-without-ssn.utils';

describe('getApplicationWithoutSsnFormFieldLabel', () => {
  it('should call t with the correct translation path key', () => {
    const t = jest.fn((key: string) => key) as unknown as TFunction;
    const label = getApplicationWithoutSsnFormFieldLabel(t, 'firstName');
    expect(t).toHaveBeenCalledWith(
      'common:applicationWithoutSsn.form.inputs.firstName'
    );
    expect(label).toBe('common:applicationWithoutSsn.form.inputs.firstName');
  });
});
