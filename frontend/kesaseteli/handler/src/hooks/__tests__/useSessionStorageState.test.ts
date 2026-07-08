/* eslint-disable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
import { act,renderHook } from '@testing-library/react-hooks';

import useSessionStorageState from '../useSessionStorageState';

describe('useSessionStorageState', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns initial value when no saved value exists', () => {
    const { result } = renderHook(() => useSessionStorageState('test-key', 0));
    expect(result.current[0]).toBe(0);
  });

  it('updates storage and state on setter call', () => {
    const { result } = renderHook(() => useSessionStorageState('test-key', 0));

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.sessionStorage.getItem('test-key')).toBe('1');
  });

  it('loads saved value on mount', () => {
    window.sessionStorage.setItem('test-key', '2');
    const { result } = renderHook(() => useSessionStorageState('test-key', 0));

    expect(result.current[0]).toBe(2);
  });
});

/* eslint-enable scanjs-rules/property_sessionStorage, scanjs-rules/identifier_sessionStorage */
