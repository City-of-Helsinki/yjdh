import Router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef } from 'react';
import useConfirm from 'shared/hooks/useConfirm';

export const leaveConfirmStore = {
  isBypassed: false,
};

export const setLeaveConfirmBypassed = (bypassed: boolean): void => {
  leaveConfirmStore.isBypassed = bypassed;
};

const getPathWithoutHash = (p: string): string => p.split('#')[0];

const useLeaveConfirm = (unsavedChanges: boolean, message: string): void => {
  const { confirm } = useConfirm();
  const { t } = useTranslation();

  // Ref to track if we should allow the next navigation attempt
  const isConfirmedRef = useRef(false);

  // Reset the global bypass on initial mount of the form
  useEffect(() => {
    leaveConfirmStore.isBypassed = false;
  }, []);

  useEffect(() => {
    const shouldBypass = (): boolean =>
      !unsavedChanges || isConfirmedRef.current || leaveConfirmStore.isBypassed;

    const handleRouteChange = async (url: string): Promise<void> => {
      // If we've already confirmed OR there are no changes OR bypassed, let them through
      if (shouldBypass()) {
        return;
      }

      // If the URL is the same (ignoring hash), don't trigger (prevents loops and internal anchors)
      if (getPathWithoutHash(Router.asPath) === getPathWithoutHash(url)) {
        return;
      }

      // 1. Tell Next.js to stop the current navigation
      Router.events.emit('routeChangeError');

      // 2. Open the custom confirmation modal
      const isConfirmed = await confirm({
        header: message,
        submitButtonLabel: t('common:dialog.confirm'),
        submitButtonVariant: 'danger',
        content: t('common:application.buttons.leave_confirmation_description'),
      });

      if (isConfirmed) {
        // 3. User said YES: set the flag and manually push the route
        isConfirmedRef.current = true;
        Router.push(url).catch(() => {
          isConfirmedRef.current = false;
        });
      }

      // 4. Throw the actual error to cancel the initial 'routeChangeStart'
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'Abort route change. Please ignore this error.';
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent): string | null => {
      if (
        unsavedChanges &&
        !isConfirmedRef.current &&
        !leaveConfirmStore.isBypassed
      ) {
        e.preventDefault();
        // Modern browsers ignore the return string and show a generic message
        // eslint-disable-next-line no-return-assign, no-param-reassign
        return (e.returnValue = message);
      }
      return null;
    };

    const handleGlobalClick = async (e: MouseEvent): Promise<void> => {
      if (shouldBypass()) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor || !anchor.href) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const isInternal = url.origin === window.location.origin;

      if (
        isInternal &&
        !anchor.hasAttribute('download') &&
        anchor.target !== '_blank'
      ) {
        const isSamePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;

        const path = url.pathname + url.search + url.hash;

        if (!isSamePage && Router.asPath !== path) {
          e.preventDefault();
          const isConfirmed = await confirm({
            header: message,
            submitButtonLabel: t('common:application.buttons.discard'),
            submitButtonVariant: 'danger',
            content: t(
              'common:application.buttons.leave_confirmation_description'
            ),
          });

          if (isConfirmed) {
            isConfirmedRef.current = true;
            Router.push(path).catch(() => {
              isConfirmedRef.current = false;
            });
          }
        }
      }
    };

    const handleGlobalClickWrapper = (e: MouseEvent): void => {
      void handleGlobalClick(e);
    };

    // Subscriptions
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('click', handleGlobalClickWrapper, true);
    Router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', handleGlobalClickWrapper, true);
      Router.events.off('routeChangeStart', handleRouteChange);
      // Reset the ref on unmount
      isConfirmedRef.current = false;
    };
  }, [unsavedChanges, message, confirm, t]);
};

export default useLeaveConfirm;
