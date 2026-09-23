import type { Assignee } from 'kesaseteli-shared/types/application';
import type User from 'shared/types/user';

/**
 * Extracts the assignee ID from an Assignee object or string representation.
 */
export const getAssigneeId = (
  assignee?: Assignee | string | null
): string | undefined => {
  if (!assignee) {
    return undefined;
  }
  return typeof assignee === 'object' ? assignee.id : assignee;
};

/**
 * Extracts the assignee name from an Assignee object or string representation.
 */
export const getAssigneeName = (
  assignee?: Assignee | string | null
): string | undefined => {
  if (!assignee) {
    return undefined;
  }
  return typeof assignee === 'object' ? assignee.name : assignee;
};

/**
 * Checks whether the current user matches the assignee.
 */
export const isUserAssignee = (
  user?: User | null,
  assignee?: Assignee | string | null
): boolean => {
  const assigneeId = getAssigneeId(assignee);
  return Boolean(
    user?.id &&
      assigneeId &&
      (user.id === assigneeId || String(user.id) === String(assigneeId))
  );
};
