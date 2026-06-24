import { act, renderHook } from '@testing-library/react';
import {
  isYouthApplicationCreationError,
  isYouthApplicationValidationError,
} from 'kesaseteli/youth/utils/type-guards';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useRouter } from 'next/router';
import { useFormContext } from 'react-hook-form';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';
import useLocale from 'shared/hooks/useLocale';

import useHandleYouthApplicationSubmit from '../useHandleYouthApplicationSubmit';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('shared/hooks/useLocale', () => jest.fn());
jest.mock('shared/hooks/useGoToPage', () => jest.fn());
jest.mock('shared/hooks/useErrorHandler', () => jest.fn());
jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));
// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useGdprMaskedFormValues', () => () => ({}));
jest.mock('kesaseteli/youth/utils/type-guards', () => ({
  isYouthApplicationCreationError: jest.fn(),
  isYouthApplicationValidationError: jest.fn(),
}));

describe('useHandleYouthApplicationSubmit', () => {
  const mockPush = jest.fn();
  const mockGoToPage = jest.fn();
  const mockErrorHandler = jest.fn();
  const mockReset = jest.fn();
  const mockSetError = jest.fn();
  const mockGetValues = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useGoToPage as jest.Mock).mockReturnValue(mockGoToPage);
    (useErrorHandler as jest.Mock).mockReturnValue(mockErrorHandler);
    (useFormContext as jest.Mock).mockReturnValue({
      formState: { isDirty: false, isSubmitted: false },
      setError: mockSetError,
      getValues: mockGetValues,
      reset: mockReset,
    });
  });

  it('handleSaveSuccess redirects to thankyou page', () => {
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());

    act(() => {
      result.current.handleSaveSuccess({
        id: '123',
      } as CreatedYouthApplication);
    });

    expect(mockGoToPage).toHaveBeenCalledWith('/thankyou');
  });

  it('handleErrorResponse redirects on specific code errors', () => {
    jest.mocked(isYouthApplicationCreationError).mockReturnValue(true);
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());

    const creationError = {
      response: {
        data: {
          code: 'already_assigned',
        },
      },
    };

    act(() => {
      result.current.handleErrorResponse(creationError);
    });

    expect(mockPush).toHaveBeenCalledWith('/fi/already_assigned');
  });

  it('handleErrorResponse sets error summary on please_recheck_data', () => {
    jest.mocked(isYouthApplicationCreationError).mockReturnValue(true);
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());

    const creationError = {
      response: {
        data: {
          code: 'please_recheck_data',
        },
      },
    };

    act(() => {
      result.current.handleErrorResponse(creationError);
    });

    expect(result.current.submitError).toEqual({
      type: 'please_recheck_data',
      errorFields: [],
    });
    expect(mockReset).toHaveBeenCalled();
  });

  it('handleErrorResponse asserts unreachable for unknown code', () => {
    jest.mocked(isYouthApplicationCreationError).mockReturnValue(true);
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());

    const unknownError = {
      response: {
        data: {
          code: 'unknown_code',
        },
      },
    };

    expect(() => {
      act(() => {
        result.current.handleErrorResponse(unknownError);
      });
    }).toThrow();
  });

  it('handleErrorResponse handles validation errors', () => {
    jest.mocked(isYouthApplicationCreationError).mockReturnValue(false);
    jest.mocked(isYouthApplicationValidationError).mockReturnValue(true);
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());

    const valError = {
      response: {
        status: 400,
        data: {
          first_name: ['Error text'],
        },
      },
    };

    act(() => {
      result.current.handleErrorResponse(valError);
    });

    expect(mockSetError).toHaveBeenCalledWith('first_name', {
      type: 'pattern',
    });
    expect(result.current.submitError?.type).toBe('validation_error');
  });

  it('handleErrorResponse calls default error handler for generic errors', () => {
    jest.mocked(isYouthApplicationCreationError).mockReturnValue(false);
    jest.mocked(isYouthApplicationValidationError).mockReturnValue(false);
    const { result } = renderHook(() => useHandleYouthApplicationSubmit());
    const genericError = new Error('Generic error');

    act(() => {
      result.current.handleErrorResponse(genericError);
    });

    expect(mockErrorHandler).toHaveBeenCalledWith(genericError);
  });
});
