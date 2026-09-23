import User from 'shared/types/user';

import {
  getAssigneeId,
  getAssigneeName,
  isUserAssignee,
} from '../assignee.utils';

describe('assignee.utils', () => {
  describe('getAssigneeId', () => {
    it('returns undefined for null, undefined, or empty values', () => {
      expect(getAssigneeId(null)).toBeUndefined();
      expect(getAssigneeId()).toBeUndefined();
      expect(getAssigneeId('')).toBeUndefined();
    });

    it('extracts id from an Assignee object', () => {
      expect(getAssigneeId({ id: 'user-123', name: 'Test User' })).toBe(
        'user-123'
      );
    });

    it('returns the string when assignee is a string', () => {
      expect(getAssigneeId('user-123')).toBe('user-123');
    });
  });

  describe('getAssigneeName', () => {
    it('returns undefined for null, undefined, or empty values', () => {
      expect(getAssigneeName(null)).toBeUndefined();
      expect(getAssigneeName()).toBeUndefined();
      expect(getAssigneeName('')).toBeUndefined();
    });

    it('extracts name from an Assignee object', () => {
      expect(getAssigneeName({ id: 'user-123', name: 'Test User' })).toBe(
        'Test User'
      );
    });

    it('returns the string when assignee is a string', () => {
      expect(getAssigneeName('Test User')).toBe('Test User');
    });
  });

  describe('isUserAssignee', () => {
    const mockUser: User = {
      id: 'user-123',
      name: 'Handler User',
      given_name: 'Handler',
      family_name: 'User',
    };

    it('returns true when user id matches object assignee id', () => {
      expect(
        isUserAssignee(mockUser, { id: 'user-123', name: 'Different Name' })
      ).toBe(true);
    });

    it('returns true when user id matches string assignee id', () => {
      expect(isUserAssignee(mockUser, 'user-123')).toBe(true);
    });

    it('returns true when ids match after string conversion (e.g. number vs string)', () => {
      const userWithNumericId = { ...mockUser, id: 123 as unknown as string };
      expect(isUserAssignee(userWithNumericId, '123')).toBe(true);
      const userWithStringId = { ...mockUser, id: '123' };
      expect(
        isUserAssignee(userWithStringId, {
          id: 123 as unknown as string,
          name: 'Handler',
        })
      ).toBe(true);
    });

    it('returns false when user id does not match assignee id', () => {
      expect(
        isUserAssignee(mockUser, { id: 'other-user', name: 'Handler User' })
      ).toBe(false);
      expect(isUserAssignee(mockUser, 'other-user')).toBe(false);
    });

    it('returns false when user is null or undefined', () => {
      expect(isUserAssignee(null, { id: 'user-123', name: 'Test' })).toBe(
        false
      );
      expect(isUserAssignee(undefined, 'user-123')).toBe(false);
    });

    it('returns false when assignee is null or undefined', () => {
      expect(isUserAssignee(mockUser, null)).toBe(false);
      expect(isUserAssignee(mockUser)).toBe(false);
    });

    it('returns false when assignee has empty id', () => {
      expect(isUserAssignee(mockUser, { id: '', name: 'Test' })).toBe(false);
    });
  });
});
