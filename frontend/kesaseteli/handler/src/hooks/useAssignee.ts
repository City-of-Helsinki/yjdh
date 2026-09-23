import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import {
  getAssigneeId,
  getAssigneeName,
  isUserAssignee,
} from 'kesaseteli/handler/utils/assignee.utils';
import type { Assignee } from 'kesaseteli-shared/types/application';
import type User from 'shared/types/user';

export type UseAssigneeResult = {
  isAssignee: boolean;
  assigneeId?: string;
  assigneeName?: string;
  user?: User;
};

/**
 * Hook to retrieve parsed assignee details and determine if the current user is assigned.
 */
const useAssignee = (
  assignee?: Assignee | string | null
): UseAssigneeResult => {
  const { data: user } = useUserQuery();

  const assigneeId = getAssigneeId(assignee);
  const assigneeName = getAssigneeName(assignee);
  const isAssignee = isUserAssignee(user, assignee);

  return {
    isAssignee,
    assigneeId,
    assigneeName,
    user,
  };
};

/**
 * Convenience hook that returns only whether the current user is assigned.
 */
export const useIsAssignee = (assignee?: Assignee | string | null): boolean =>
  useAssignee(assignee).isAssignee;

export default useAssignee;
