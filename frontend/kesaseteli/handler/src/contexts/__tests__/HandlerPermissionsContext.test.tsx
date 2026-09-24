import { renderHook } from '@testing-library/react';
import isHandlerExternalMessagesEnabled from 'kesaseteli/handler/flags/is-handler-external-messages-enabled';
import { useIsAssignee } from 'kesaseteli/handler/hooks/useAssignee';
import { APPLICATION_LIST_TYPES } from 'kesaseteli/handler/types/application';
import { NoteTargetType, NoteType } from 'kesaseteli/handler/types/note';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import React from 'react';

import {
  HandlerPermissionsProvider,
  HandlerPermissionsProviderProps,
  useHandlerPermissions,
} from '../HandlerPermissionsContext';

jest.mock('kesaseteli/handler/hooks/useAssignee');
jest.mock('kesaseteli/handler/flags/is-handler-external-messages-enabled');

const getWrapper =
  (
    props: Omit<HandlerPermissionsProviderProps, 'children'>
  ): React.FC<React.PropsWithChildren<unknown>> =>
  ({ children }) =>
    (
      <HandlerPermissionsProvider {...props}>
        {children}
      </HandlerPermissionsProvider>
    );

describe('HandlerPermissionsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws an error if used outside of a provider', () => {
    // eslint-disable-next-line no-console
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useHandlerPermissions())).toThrow(
      'useHandlerPermissions must be used within a HandlerPermissionsProvider'
    );
    // eslint-disable-next-line no-console
    (console.error as jest.Mock).mockRestore();
  });

  describe('when user is not assignee', () => {
    beforeEach(() => {
      (useIsAssignee as jest.Mock).mockReturnValue(false);
      (isHandlerExternalMessagesEnabled as jest.Mock).mockReturnValue(true);
    });

    it('all permissions are false', () => {
      const { result } = renderHook(() => useHandlerPermissions(), {
        wrapper: getWrapper({
          applicationType: APPLICATION_LIST_TYPES.YOUTH,
          status: 'submitted',
          assignee: 'some-user',
        }),
      });

      expect(result.current).toEqual({
        isAssignee: false,
        canUploadAttachments: false,
        canDeleteAttachments: false,
        canAddAttachmentComments: false,
        canAddExternalMessage: false,
        hasNotePermission: expect.any(Function),
      });
    });
  });

  describe('when user is assignee', () => {
    beforeEach(() => {
      (useIsAssignee as jest.Mock).mockReturnValue(true);
      (isHandlerExternalMessagesEnabled as jest.Mock).mockReturnValue(true);
    });

    it('has all permissions for an unhandled youth application', () => {
      const { result } = renderHook(() => useHandlerPermissions(), {
        wrapper: getWrapper({
          applicationType: APPLICATION_LIST_TYPES.YOUTH,
          status: 'submitted',
          assignee: 'current-user',
        }),
      });

      expect(result.current).toEqual({
        isAssignee: true,
        canUploadAttachments: true,
        canDeleteAttachments: true, // not handled
        canAddAttachmentComments: true,
        canAddExternalMessage: true, // feature flag is true
        hasNotePermission: expect.any(Function),
      });
    });

    it('cannot delete attachments for a handled youth application', () => {
      const { result } = renderHook(() => useHandlerPermissions(), {
        wrapper: getWrapper({
          applicationType: APPLICATION_LIST_TYPES.YOUTH,
          status: 'accepted',
          assignee: 'current-user',
        }),
      });

      expect(result.current.canDeleteAttachments).toBe(false);
    });

    it('cannot delete attachments for a handled employer application', () => {
      const { result } = renderHook(() => useHandlerPermissions(), {
        wrapper: getWrapper({
          applicationType: APPLICATION_LIST_TYPES.EMPLOYER,
          status: EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
          assignee: 'current-user',
        }),
      });

      expect(result.current.canDeleteAttachments).toBe(false);
    });

    it('cannot add external messages if feature flag is false', () => {
      (isHandlerExternalMessagesEnabled as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useHandlerPermissions(), {
        wrapper: getWrapper({
          applicationType: APPLICATION_LIST_TYPES.YOUTH,
          status: 'submitted',
          assignee: 'current-user',
        }),
      });

      expect(result.current.canAddExternalMessage).toBe(false);
    });

    describe('hasNotePermission', () => {
      it('returns correct permission based on target and type', () => {
        const { result } = renderHook(() => useHandlerPermissions(), {
          wrapper: getWrapper({
            applicationType: APPLICATION_LIST_TYPES.YOUTH,
            status: 'submitted',
            assignee: 'current-user',
          }),
        });

        const { hasNotePermission } = result.current;
        // As assignee with flag true, all should be true
        expect(
          hasNotePermission(NoteTargetType.YOUTH_APPLICATION, NoteType.INTERNAL)
        ).toBe(true);
        expect(
          hasNotePermission(NoteTargetType.ATTACHMENT, NoteType.INTERNAL)
        ).toBe(true);
        expect(
          hasNotePermission(
            NoteTargetType.YOUTH_APPLICATION,
            NoteType.EXTERNAL_MESSAGE
          )
        ).toBe(true);
      });

      it('returns false for external messages when flag is false', () => {
        (isHandlerExternalMessagesEnabled as jest.Mock).mockReturnValue(false);
        const { result } = renderHook(() => useHandlerPermissions(), {
          wrapper: getWrapper({
            applicationType: APPLICATION_LIST_TYPES.YOUTH,
            status: 'submitted',
            assignee: 'current-user',
          }),
        });

        const { hasNotePermission } = result.current;
        // As assignee with flag false
        expect(
          hasNotePermission(NoteTargetType.YOUTH_APPLICATION, NoteType.INTERNAL)
        ).toBe(true);
        expect(
          hasNotePermission(
            NoteTargetType.YOUTH_APPLICATION,
            NoteType.EXTERNAL_MESSAGE
          )
        ).toBe(false);
      });
    });
  });
});
