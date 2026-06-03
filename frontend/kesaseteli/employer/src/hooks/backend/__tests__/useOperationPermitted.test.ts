import { renderHook } from '@testing-library/react-hooks';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import useAuth from 'shared/hooks/useAuth';
import useIsRouting from 'shared/hooks/useIsRouting';

import useIsOperationPermitted from '../useOperationPermitted';

jest.mock('shared/hooks/useAuth');
jest.mock('shared/hooks/useIsRouting');
jest.mock('kesaseteli/employer/hooks/backend/useUserQuery');

describe('useIsOperationPermitted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when authenticated, user query is successful, and not routing', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useUserQuery as jest.Mock).mockReturnValue({ isSuccess: true });
    (useIsRouting as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useIsOperationPermitted());
    expect(result.current).toBe(true);
  });

  it('returns false when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useUserQuery as jest.Mock).mockReturnValue({ isSuccess: true });
    (useIsRouting as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useIsOperationPermitted());
    expect(result.current).toBe(false);
  });

  it('returns false when user query has not succeeded', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useUserQuery as jest.Mock).mockReturnValue({ isSuccess: false });
    (useIsRouting as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useIsOperationPermitted());
    expect(result.current).toBe(false);
  });

  it('returns false when routing is in progress', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useUserQuery as jest.Mock).mockReturnValue({ isSuccess: true });
    (useIsRouting as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useIsOperationPermitted());
    expect(result.current).toBe(false);
  });
});
