import { renderHook } from '@testing-library/react';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';

import useAssignee, { useIsAssignee } from '../useAssignee';

jest.mock('kesaseteli/handler/hooks/backend/useUserQuery');

describe('useAssignee', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Current Handler',
    given_name: 'Current',
    family_name: 'Handler',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
    });
  });

  it('returns false for isAssignee when assignee is null or undefined', () => {
    const { result: nullResult } = renderHook(() => useAssignee(null));
    expect(nullResult.current).toEqual({
      isAssignee: false,
      assigneeId: undefined,
      assigneeName: undefined,
      user: mockUser,
    });

    const { result: undefinedResult } = renderHook(() => useAssignee());
    expect(undefinedResult.current.isAssignee).toBe(false);
  });

  it('returns true when user matches object assignee id', () => {
    const { result } = renderHook(() =>
      useAssignee({ id: 'user-123', name: 'Current Handler Display' })
    );

    expect(result.current).toEqual({
      isAssignee: true,
      assigneeId: 'user-123',
      assigneeName: 'Current Handler Display',
      user: mockUser,
    });
  });

  it('returns false when assignee is someone else with different id', () => {
    const { result } = renderHook(() =>
      useAssignee({ id: 'other-id', name: 'Other User' })
    );

    expect(result.current).toEqual({
      isAssignee: false,
      assigneeId: 'other-id',
      assigneeName: 'Other User',
      user: mockUser,
    });
  });

  it('returns true when assignee is a string matching user id', () => {
    const { result } = renderHook(() => useAssignee('user-123'));

    expect(result.current).toEqual({
      isAssignee: true,
      assigneeId: 'user-123',
      assigneeName: 'user-123',
      user: mockUser,
    });
  });

  it('returns false when user is not loaded', () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() =>
      useAssignee({ id: 'user-123', name: 'Current Handler' })
    );

    expect(result.current.isAssignee).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
});

describe('useIsAssignee', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Current Handler',
    given_name: 'Current',
    family_name: 'Handler',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserQuery as jest.Mock).mockReturnValue({
      data: mockUser,
    });
  });

  it('returns boolean directly', () => {
    const { result: trueResult } = renderHook(() =>
      useIsAssignee({ id: 'user-123', name: 'Current Handler' })
    );
    expect(trueResult.current).toBe(true);

    const { result: falseResult } = renderHook(() =>
      useIsAssignee({ id: 'other-id', name: 'Other' })
    );
    expect(falseResult.current).toBe(false);
  });
});
