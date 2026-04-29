import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback,useEffect, useRef } from 'react';
import useConfirm from 'shared/hooks/useConfirm';

import {
  getAnchorPath,
  leaveConfirmStore,
  shouldBlockNavigation,
} from './useLeaveConfirm.utils';

export {
  leaveConfirmStore,
  setLeaveConfirmBypassed,
} from './useLeaveConfirm.utils';

/**
 * Payload type for the confirm dialog.
 */
type ConfirmPayload = {
  header: string;
  submitButtonLabel: string;
  submitButtonVariant: string;
  content: string;
};

/**
 * Dependencies required by the leave confirmation service methods.
 */
type HandlerDeps = {
  unsavedChanges: boolean;
  message: string;
  isConfirmedRef: { current: boolean };
  confirm: (payload: ConfirmPayload) => Promise<boolean>;
  t: (key: string) => string;
};

/**
 * Service class that maps the internal leave confirmation handlers.
 * This class groups the event-related logic for better organization and readability.
 */
const LeaveConfirmService = {
  /**
   * Updates state and triggers navigation after user confirmation.
   */
  handleConfirmAction(
    pathOrUrl: string,
    isConfirmedRef: { current: boolean }
  ): void {
    // eslint-disable-next-line no-param-reassign
    isConfirmedRef.current = true;
    void Router.push(pathOrUrl).catch(() => {
      // eslint-disable-next-line no-param-reassign
      isConfirmedRef.current = false;
    });
  },

  /**
   * Orchestrates the confirmation dialog and resulting navigation.
   */
  async showConfirm(
    url: string,
    confirmLabel: string,
    deps: HandlerDeps
  ): Promise<void> {
    const isConfirmed = await deps.confirm({
      header: deps.message,
      submitButtonLabel: confirmLabel,
      submitButtonVariant: 'danger',
      content: deps.t(
        'common:application.buttons.leave_confirmation_description'
      ),
    });

    if (isConfirmed) {
      this.handleConfirmAction(url, deps.isConfirmedRef);
    }
  },

  /**
   * Logic for Next.js route change interception.
   */
  handleRouteChange(url: string, deps: HandlerDeps): void {
    const { unsavedChanges, isConfirmedRef, t } = deps;
    if (
      !shouldBlockNavigation({
        targetUrl: url,
        unsavedChanges,
        isConfirmed: isConfirmedRef.current,
        globalBypass: leaveConfirmStore.isBypassed,
      })
    ) {
      return;
    }

    Router.events.emit('routeChangeError');
    void this.showConfirm(url, t('common:dialog.confirm'), deps);

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 'Abort route change. Please ignore this error.';
  },

  /**
   * Logic for browser native beforeunload interception.
   */
  handleBeforeUnload(
    e: BeforeUnloadEvent,
    deps: HandlerDeps
  ): string | null {
    const { unsavedChanges, isConfirmedRef, message } = deps;
    if (
      !shouldBlockNavigation({
        targetUrl: '',
        unsavedChanges,
        isConfirmed: isConfirmedRef.current,
        globalBypass: leaveConfirmStore.isBypassed,
      })
    ) {
      return null;
    }
    e.preventDefault();
    // eslint-disable-next-line no-return-assign, no-param-reassign
    return (e.returnValue = message);
  },

  /**
   * Logic for catching direct internal anchor link clicks.
   */
  handleGlobalClick(e: MouseEvent, deps: HandlerDeps): void {
    const { unsavedChanges, isConfirmedRef, t } = deps;
    const path = getAnchorPath(e);
    if (
      !path ||
      !shouldBlockNavigation({
        targetUrl: path,
        unsavedChanges,
        isConfirmed: isConfirmedRef.current,
        globalBypass: leaveConfirmStore.isBypassed,
      })
    ) {
      return;
    }

    e.preventDefault();
    void this.showConfirm(path, t('common:application.buttons.discard'), deps);
  },
};

/**
 * Hook to show a confirmation dialog when the user tries to leave a page with unsaved changes.
 * Handles Next.js route changes, browser back/forward buttons, and direct link clicks.
 *
 * @param unsavedChanges - Boolean flag indicating if there are unsaved changes.
 * @param message - The message to display in the confirmation dialog (header).
 */
const useLeaveConfirm = (unsavedChanges: boolean, message: string): void => {
  const { confirm } = useConfirm();
  const { t } = useTranslation();

  // Ref to track if we should allow the next navigation attempt
  const isConfirmedRef = useRef(false);

  // Reset the global bypass on initial mount of the form
  useEffect(() => {
    leaveConfirmStore.isBypassed = false;
  }, []);

  // Map hook state to dependency object for the service class
  const deps: HandlerDeps = {
    unsavedChanges,
    message,
    isConfirmedRef,
    confirm: confirm as (payload: ConfirmPayload) => Promise<boolean>,
    t,
  };

  /**
   * The following handlers are mapped to the LeaveConfirmService static methods.
   * This removes the implementation details from the hook's lifecycle.
   */

  const routeHandler = useCallback(
    (url: string) => LeaveConfirmService.handleRouteChange(url, deps),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsavedChanges, message, confirm, t]
  );

  const unloadHandler = useCallback(
    (e: BeforeUnloadEvent) => LeaveConfirmService.handleBeforeUnload(e, deps),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsavedChanges, message]
  );

  const clickHandler = useCallback(
    (e: MouseEvent) => LeaveConfirmService.handleGlobalClick(e, deps),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsavedChanges, message, confirm, t]
  );

  useEffect(() => {
    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('click', clickHandler, true);
    Router.events.on('routeChangeStart', routeHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
      window.removeEventListener('click', clickHandler, true);
      Router.events.off('routeChangeStart', routeHandler);
      isConfirmedRef.current = false;
    };
  }, [unloadHandler, clickHandler, routeHandler]);
};

export default useLeaveConfirm;
