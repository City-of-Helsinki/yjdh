import { act, renderHook } from '@testing-library/react-hooks';

import useSidebarState from '../useSidebarState';

describe('useSidebarState', () => {
  it('initializes to false and toggles state correctly', () => {
    const { result } = renderHook(() => useSidebarState());

    const [isOpenBefore] = result.current;
    expect(isOpenBefore).toBe(false);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });

    const [isOpenAfter] = result.current;
    expect(isOpenAfter).toBe(true);

    act(() => {
      const [, toggle] = result.current;
      toggle();
    });

    const [isOpenAfterSecondToggle] = result.current;
    expect(isOpenAfterSecondToggle).toBe(false);
  });
});
