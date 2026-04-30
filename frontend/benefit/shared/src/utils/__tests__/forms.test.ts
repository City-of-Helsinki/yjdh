import { VALIDATION_MESSAGE_KEYS } from 'benefit-shared/constants';
import { getErrorText } from 'benefit-shared/utils/forms';
import { FormikErrors, FormikTouched, FormikValues } from 'formik';
import { TFunction } from 'next-i18next';

describe('forms utils', () => {
  const t = jest.fn((key: string, options?: Record<string, unknown>) =>
    options ? `${key}:${JSON.stringify(options)}` : key
  ) as unknown as TFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty string when there is no error', () => {
    expect(getErrorText({}, {}, 'field', t, false)).toBe('');
  });

  it('returns an empty string when the field is not touched and form is not submitted', () => {
    const errors: FormikErrors<FormikValues> = {
      field: 'common:error.required',
    };
    const touched: FormikTouched<FormikValues> = {
      field: false,
    };

    expect(getErrorText(errors, touched, 'field', t, false)).toBe('');
  });

  it('translates string errors', () => {
    const errors: FormikErrors<FormikValues> = {
      field: VALIDATION_MESSAGE_KEYS.REQUIRED,
    };
    const touched: FormikTouched<FormikValues> = {
      field: true,
    };

    expect(getErrorText(errors, touched, 'field', t, false)).toBe(
      VALIDATION_MESSAGE_KEYS.REQUIRED
    );
    expect(t).toHaveBeenCalledWith(VALIDATION_MESSAGE_KEYS.REQUIRED);
  });

  it('translates object errors with key and interpolation values', () => {
    const errors: FormikErrors<FormikValues> = {
      field: {
        key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
        min: '2',
      },
    };

    expect(getErrorText(errors, {}, 'field', t, true)).toBe(
      `${VALIDATION_MESSAGE_KEYS.NUMBER_MIN}:${JSON.stringify({
        key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
        min: '2',
      })}`
    );
    expect(t).toHaveBeenCalledWith(VALIDATION_MESSAGE_KEYS.NUMBER_MIN, {
      key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
      min: '2',
    });
  });

  it('falls back to an empty translation key for object errors without key', () => {
    const errors: FormikErrors<FormikValues> = {
      field: {
        min: '2',
      },
    };

    expect(getErrorText(errors, {}, 'field', t, true)).toBe(
      ':{"min":"2"}'
    );
    expect(t).toHaveBeenCalledWith('', {
      min: '2',
    });
  });
});