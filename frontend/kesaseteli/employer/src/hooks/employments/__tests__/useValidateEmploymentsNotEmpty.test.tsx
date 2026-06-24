import { renderHook } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';

import useValidateEmploymentsNotEmpty from '../useValidateEmploymentsNotEmpty';

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

describe('useValidateEmploymentsNotEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets a minLength error when list is empty', () => {
    const mockSetError = jest.fn();
    (useFormContext as jest.Mock).mockReturnValue({
      setError: mockSetError,
    });

    renderHook(() => useValidateEmploymentsNotEmpty([]));

    expect(mockSetError).toHaveBeenCalledTimes(1);
    expect(mockSetError).toHaveBeenCalledWith('summer_vouchers', {
      type: 'minLength',
    });
  });

  it('does not set error when list is not empty', () => {
    const mockSetError = jest.fn();
    (useFormContext as jest.Mock).mockReturnValue({
      setError: mockSetError,
    });

    renderHook(() =>
      useValidateEmploymentsNotEmpty([{}] as unknown as Parameters<
        typeof useValidateEmploymentsNotEmpty
      >[0])
    );

    expect(mockSetError).not.toHaveBeenCalled();
  });
});
