import { isApplicationWithoutSsnValidationError } from '../type-guards';

describe('isApplicationWithoutSsnValidationError', () => {
  it('should return false for non-axios errors', () => {
    expect(isApplicationWithoutSsnValidationError(new Error('error'))).toBe(
      false
    );
    expect(isApplicationWithoutSsnValidationError(null)).toBe(false);
    expect(isApplicationWithoutSsnValidationError({})).toBe(false);
  });

  it('should return false for axios errors with status other than 400', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { first_name: ['Error'] },
      },
    };
    expect(isApplicationWithoutSsnValidationError(error)).toBe(false);
  });

  it('should return false for axios errors with status 400 but no matching keys', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { invalid_key: ['Error'] },
      },
    };
    expect(isApplicationWithoutSsnValidationError(error)).toBe(false);
  });

  it('should return true for axios errors with status 400 and matching keys', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { first_name: ['This field is required'] },
      },
    };
    expect(isApplicationWithoutSsnValidationError(error)).toBe(true);
  });
});
