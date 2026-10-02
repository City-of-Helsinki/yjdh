import { renderHook } from '@testing-library/react';
import useCurrentUserQuery from 'kesaseteli/handler/hooks/backend/useCurrentUserQuery';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import isRealIntegrationsEnabled from 'kesaseteli-shared/flags/is-real-integrations-enabled';
import { useRouter } from 'next/router';

import useIsApprover from '../useIsApprover';

jest.mock('kesaseteli/handler/hooks/backend/useCurrentUserQuery');
jest.mock('kesaseteli/handler/hooks/backend/useUserQuery');
jest.mock('kesaseteli-shared/flags/is-real-integrations-enabled');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('useIsApprover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ route: ROUTES.DASHBOARD });
  });

  it('returns false when user is not authenticated', () => {
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(false);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isSuccess: false,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { is_approver: true },
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(false);
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: false });
  });

  it('returns false on anonymous routes without querying user', () => {
    (useRouter as jest.Mock).mockReturnValue({ route: ROUTES.LOGIN });
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(false);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isSuccess: false,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { is_approver: true },
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(false);
    expect(useUserQuery).toHaveBeenCalledWith({ enabled: false });
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: false });
  });

  it('returns true when real integrations are disabled (mock mode) and user is authenticated', () => {
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(false);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: { id: 'user-1' },
      isSuccess: true,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { is_approver: false },
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(true);
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: true });
  });

  it('returns true when real integrations are enabled and user is an approver', () => {
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(true);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: { id: 'user-1' },
      isSuccess: true,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { is_approver: true },
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(true);
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: true });
  });

  it('returns false when real integrations are enabled and user is not an approver', () => {
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(true);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: { id: 'user-1' },
      isSuccess: true,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { is_approver: false },
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(false);
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: true });
  });

  it('returns false when real integrations are enabled and currentUserQuery data is undefined', () => {
    (isRealIntegrationsEnabled as jest.Mock).mockReturnValue(true);
    (useUserQuery as jest.Mock).mockReturnValue({
      data: { id: 'user-1' },
      isSuccess: true,
    });
    (useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useIsApprover());

    expect(result.current.isApprover).toBe(false);
    expect(useCurrentUserQuery).toHaveBeenCalledWith({ enabled: true });
  });
});
