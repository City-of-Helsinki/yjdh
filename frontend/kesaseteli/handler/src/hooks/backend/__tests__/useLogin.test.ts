import { renderHook } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';

import useLogin from '../useLogin';

describe('useLogin', () => {
  it('redirects to login URL on trigger', async () => {
    mockRouter.setCurrentUrl('/');
    const { result } = renderHook(() => useLogin());

    await result.current();

    expect(mockRouter.asPath).toContain('/login');
    expect(mockRouter.asPath).toContain('lang=fi');
  });
});
