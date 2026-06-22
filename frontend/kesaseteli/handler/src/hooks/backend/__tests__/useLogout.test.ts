import { renderHook } from '@testing-library/react';
import mockRouter from 'next-router-mock';

import useLogout from '../useLogout';

describe('useLogout', () => {
  it('redirects to logout URL on trigger', async () => {
    mockRouter.setCurrentUrl('/');
    const { result } = renderHook(() => useLogout());

    await result.current();

    expect(mockRouter.asPath).toContain('/logout');
  });
});
