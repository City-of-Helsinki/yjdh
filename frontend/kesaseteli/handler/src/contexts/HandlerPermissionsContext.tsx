import isHandlerExternalMessagesEnabled from 'kesaseteli/handler/flags/is-handler-external-messages-enabled';
import { useIsAssignee } from 'kesaseteli/handler/hooks/useAssignee';
import {
  APPLICATION_LIST_TYPES,
  ApplicationListType,
  Assignee,
  isHandledEmployerApplicationStatus,
  isHandledYouthApplicationStatus,
} from 'kesaseteli/handler/types/application';
import { NoteTargetType, NoteType } from 'kesaseteli/handler/types/note';
import React from 'react';

/**
 * Determines whether the current user has permission to manage a note
 * with the given target and type, based on their permissions.
 *
 * - Notes targeting attachments require `canAddAttachmentComments` permission.
 * - Notes of type external message require `canAddExternalMessage` permission.
 * - Standard internal notes on applications are always allowed.
 *
 * @param targetType - The target the note is attached to (e.g. application or attachment)
 * @param noteType - The visibility type of the note (e.g. internal or external message)
 * @param canAddAttachmentComments - Boolean permission flag
 * @param canAddExternalMessage - Boolean permission flag
 * @returns true if the user has permission, false otherwise
 */
const checkNotePermission = (
  targetType: NoteTargetType,
  noteType: NoteType,
  canAddAttachmentComments: boolean,
  canAddExternalMessage: boolean
): boolean =>
  (targetType !== NoteTargetType.ATTACHMENT || canAddAttachmentComments) &&
  (noteType !== NoteType.EXTERNAL_MESSAGE || canAddExternalMessage);

export type HandlerPermissionsContextType = {
  isAssignee: boolean;
  canUploadAttachments: boolean;
  canDeleteAttachments: boolean;
  canAddAttachmentComments: boolean;
  canAddExternalMessage: boolean;
  hasNotePermission: (
    targetType: NoteTargetType,
    noteType: NoteType
  ) => boolean;
};

export type HandlerPermissionsProviderProps = React.PropsWithChildren<{
  status?: string | null;
  assignee?: Assignee | string | null;
  applicationType: ApplicationListType;
}>;

export const HandlerPermissionsContext = React.createContext<
  HandlerPermissionsContextType | undefined
>(undefined);

export const HandlerPermissionsProvider: React.FC<
  HandlerPermissionsProviderProps
> = ({ status, assignee, applicationType, children }) => {
  const isAssignee = useIsAssignee(assignee);

  const isHandled =
    applicationType === APPLICATION_LIST_TYPES.YOUTH
      ? isHandledYouthApplicationStatus(status)
      : isHandledEmployerApplicationStatus(status);

  const value: HandlerPermissionsContextType = React.useMemo(() => {
    const canAddAttachmentComments = isAssignee;
    const canAddExternalMessage =
      isAssignee && isHandlerExternalMessagesEnabled();

    return {
      isAssignee,
      canUploadAttachments: isAssignee,
      canDeleteAttachments: isAssignee && !isHandled,
      canAddAttachmentComments,
      canAddExternalMessage,
      hasNotePermission: (targetType: NoteTargetType, noteType: NoteType) =>
        checkNotePermission(
          targetType,
          noteType,
          canAddAttachmentComments,
          canAddExternalMessage
        ),
    };
  }, [isAssignee, isHandled]);

  return (
    <HandlerPermissionsContext.Provider value={value}>
      {children}
    </HandlerPermissionsContext.Provider>
  );
};

export const useHandlerPermissions = (): HandlerPermissionsContextType => {
  const ctx = React.useContext(HandlerPermissionsContext);
  if (!ctx) {
    throw new Error(
      'useHandlerPermissions must be used within a HandlerPermissionsProvider'
    );
  }
  return ctx;
};
