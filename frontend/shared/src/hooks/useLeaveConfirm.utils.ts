import Router from 'next/router';

/**
 * Store for managing the bypass state of the leave confirmation.
 * This can be used to programmatically skip the confirmation modal.
 */
export const leaveConfirmStore = {
  isBypassed: false,
};

/**
 * Sets whether the leave confirmation should be bypassed.
 * @param bypassed - Whether to bypass the confirmation.
 */
export const setLeaveConfirmBypassed = (bypassed: boolean): void => {
  leaveConfirmStore.isBypassed = bypassed;
};

/**
 * Removes the hash part from a path or URL string.
 * @param p - The path or URL string.
 * @returns The string without the hash.
 */
export const getPathWithoutHash = (p: string): string => p.split('#')[0];

/**
 * Checks if an anchor element points to an internal link that should be handled by the application.
 * Excludes download links and links opening in a new tab.
 * @param anchor - The anchor element to check.
 * @returns True if the link is internal.
 */
export const isInternalLink = (anchor: HTMLAnchorElement): boolean => {
  try {
    const url = new URL(anchor.href, window.location.href);
    const isInternal = url.origin === window.location.origin;
    const isDownload = anchor.hasAttribute('download');
    const isBlank = anchor.target === '_blank';
    return isInternal && !isDownload && !isBlank;
  } catch {
    return false;
  }
};

/**
 * Checks if the given URL is a system-forced redirect that should bypass the leave confirmation modal.
 * Special parameters that trigger a bypass:
 * - sessionExpired=true: Set when the user's session has timed out.
 * - error=true: Set when a critical server error occurs.
 * - /500: The generic server error page.
 * @param url - The URL or path to check.
 * @returns True if the URL should bypass confirmation.
 */
export const isBypassUrl = (url: string): boolean => {
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

/**
 * Centralized decision logic: Should we block the navigation and show a confirmation?
 *
 * @param targetUrl - The destination URL or path.
 * @param unsavedChanges - Whether there are unsaved changes.
 * @param isConfirmed - Whether the user has already confirmed they want to leave.
 * @param globalBypass - Whether the global bypass flag is set.
 * @returns True if the navigation should be blocked.
 */
export const shouldBlockNavigation = ({
  targetUrl,
  unsavedChanges,
  isConfirmed,
  globalBypass,
}: {
  targetUrl: string;
  unsavedChanges: boolean;
  isConfirmed: boolean;
  globalBypass: boolean;
}): boolean => {
  // 1. Basic state-based bypass
  if (!unsavedChanges || isConfirmed || globalBypass) {
    return false;
  }

  // 2. URL-based bypass
  if (isBypassUrl(targetUrl)) {
    return false;
  }

  // 3. Same-page navigation bypass (ignoring hashes)
  if (targetUrl) {
    const isSamePage =
      getPathWithoutHash(Router.asPath) === getPathWithoutHash(targetUrl);
    if (isSamePage) {
      return false;
    }
  }

  return true;
};

/**
 * Extracts the internal application path from a click event if it targets an internal link.
 * @param e - The MouseEvent.
 * @returns The relative path including search and hash, or null if not an internal link.
 */
export const getAnchorPath = (e: MouseEvent): string | null => {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor || !anchor.href || !isInternalLink(anchor)) {
    return null;
  }

  const url = new URL(anchor.href, window.location.href);
  return url.pathname + url.search + url.hash;
};
