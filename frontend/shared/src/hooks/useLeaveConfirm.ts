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

const shouldBypass = (
  unsavedChanges: boolean,
  isConfirmed: boolean
): boolean => !unsavedChanges || isConfirmed || leaveConfirmStore.isBypassed;

const isInternalLink = (anchor: HTMLAnchorElement): boolean => {
  const url = new URL(anchor.href, window.location.href);
  const isInternal = url.origin === window.location.origin;
  const isDownload = anchor.hasAttribute('download');
  const isBlank = anchor.target === '_blank';
  return isInternal && !isDownload && !isBlank;
};

/**
 * Checks if the given URL is a system-forced redirect that should bypass the leave confirmation modal.
 * Special parameters that trigger a bypass:
 * - sessionExpired=true: Set when the user's session has timed out.
 * - error=true: Set when a critical server error occurs during an initial user data fetch.
 * - /500: The generic server error page.
 */
const isBypassUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return (
      urlObj.searchParams.get('sessionExpired') === 'true' ||
      urlObj.searchParams.get('error') === 'true' ||
      urlObj.pathname.endsWith('/500')
    );
  } catch {
    return (
      url.includes('sessionExpired=true') ||
      url.includes('error=true') ||
      url.includes('/500')
    );
  }
};

const useLeaveConfirm = (unsavedChanges: boolean, message: string): void => {
  const { confirm } = useConfirm();
  const { t } = useTranslation();

  // Ref to track if we should allow the next navigation attempt
  const isConfirmedRef = useRef(false);

  // Reset the global bypass on initial mount of the form
  useEffect(() => {
    leaveConfirmStore.isBypassed = false;
  }, []);

  const handleConfirmAction = (pathOrUrl: string): void => {
    isConfirmedRef.current = true;
    void Router.push(pathOrUrl).catch(() => {
      isConfirmedRef.current = false;
    });
  };

  const onConfirmRouteChange = (url: string): void => {
    void confirm({
      header: message,
      submitButtonLabel: t('common:dialog.confirm'),
      submitButtonVariant: 'danger',
      content: t('common:application.buttons.leave_confirmation_description'),
    }).then((isConfirmed) => {
      if (isConfirmed) {
        handleConfirmAction(url);
      }
      return null;
    });
  };

  const handleRouteChange = (url: string): void => {
    if (
      shouldBypass(unsavedChanges, isConfirmedRef.current) ||
      isBypassUrl(url)
    ) {
      return;
    }

    if (getPathWithoutHash(Router.asPath) === getPathWithoutHash(url)) {
      return;
    }

    Router.events.emit('routeChangeError');
    onConfirmRouteChange(url);

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 'Abort route change. Please ignore this error.';
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent): string | null => {
    if (shouldBypass(unsavedChanges, isConfirmedRef.current)) {
      return null;
    }
    e.preventDefault();
    // eslint-disable-next-line no-return-assign, no-param-reassign
    return (e.returnValue = message);
  };

  const onConfirmGlobalClick = (path: string): void => {
    void confirm({
      header: message,
      submitButtonLabel: t('common:application.buttons.discard'),
      submitButtonVariant: 'danger',
      content: t('common:application.buttons.leave_confirmation_description'),
    }).then((isConfirmed) => {
      if (isConfirmed) {
        handleConfirmAction(path);
      }
      return null;
    });
  };

  const handleGlobalClick = (e: MouseEvent): void => {
    if (shouldBypass(unsavedChanges, isConfirmedRef.current)) {
      return;
    }

    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor || !anchor.href || !isInternalLink(anchor)) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);
    const path = url.pathname + url.search + url.hash;

    if (isBypassUrl(path)) {
      return;
    }

    const isSamePage =
      url.pathname === window.location.pathname &&
      url.search === window.location.search;

    if (isSamePage || Router.asPath === path) {
      return;
    }

    e.preventDefault();
    onConfirmGlobalClick(path);
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('click', handleGlobalClick, true);
    Router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('click', handleGlobalClick, true);
      Router.events.off('routeChangeStart', handleRouteChange);
      isConfirmedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedChanges, message, confirm, t]);
};

export default useLeaveConfirm;
