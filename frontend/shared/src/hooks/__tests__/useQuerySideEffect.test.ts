import { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

import useQuerySideEffect from '../useQuerySideEffect';

describe('useQuerySideEffect', () => {
  it('handles an error instead of stale cached data', () => {
    const error = new Error('Refetch failed');
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const query = {
      data: true,
      error,
      dataUpdatedAt: 1,
      errorUpdatedAt: 2,
      isError: true,
      isSuccess: false,
      status: 'error',
    } as UseQueryResult<boolean, Error>;

    renderHook(() => useQuerySideEffect(query, { onSuccess, onError }));

    expect(onError).toHaveBeenCalledWith(error);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('handles falsy data from a successful query', () => {
    const onSuccess = jest.fn();
    const query = {
      data: false,
      error: null,
      dataUpdatedAt: 1,
      errorUpdatedAt: 0,
      isError: false,
      isSuccess: true,
      status: 'success',
    } as UseQueryResult<boolean, Error>;

    renderHook(() => useQuerySideEffect(query, { onSuccess }));

    expect(onSuccess).toHaveBeenCalledWith(false);
  });
});
