import { renderHook } from '@testing-library/react-hooks';

import useGetApplicationWithoutSsnFormFieldLabel from '../useGetApplicationWithoutSsnFormFieldLabel';

describe('useGetApplicationWithoutSsnFormFieldLabel', () => {
  it('should return translation key for firstName field', () => {
    const { result } = renderHook(() =>
      useGetApplicationWithoutSsnFormFieldLabel('firstName')
    );
    expect(result.current).toBe('Etunimi');
  });
});
