import { APPLICATION_LIST_TABS, ROUTES } from 'benefit/handler/constants';
import { APPLICATION_STATUSES, BATCH_STATUSES } from 'benefit-shared/constants';
import { useRouter } from 'next/router';
import React from 'react';
import { getSessionStorageItem } from 'shared/utils/localstorage.utils';

type NavigationProps = {
  navigateBack: () => Promise<boolean> | void;
};

export const useRouterNavigation = (
  status?: APPLICATION_STATUSES,
  batchStatus?: BATCH_STATUSES,
  isArchived?: boolean,
  forceRouteToAlterations = false,
  forceRouteToApplicationId?: string
): NavigationProps => {
  const router = useRouter();

  const statusToTabId = React.useCallback(():
    | APPLICATION_LIST_TABS
    | number => {
    if (batchStatus === BATCH_STATUSES.DECIDED_ACCEPTED) {
      return APPLICATION_LIST_TABS.IN_PAYMENT;
    }

    switch (status) {
      case APPLICATION_STATUSES.DRAFT:
        return APPLICATION_LIST_TABS.DRAFT;

      case APPLICATION_STATUSES.RECEIVED:
        return APPLICATION_LIST_TABS.RECEIVED;

      case APPLICATION_STATUSES.HANDLING:
        return APPLICATION_LIST_TABS.HANDLING;

      case APPLICATION_STATUSES.INFO_REQUIRED:
        return APPLICATION_LIST_TABS.HANDLING;

      case APPLICATION_STATUSES.ACCEPTED:
        return APPLICATION_LIST_TABS.ACCEPTED;

      case APPLICATION_STATUSES.REJECTED:
        return APPLICATION_LIST_TABS.REJECTED;

      default:
        return 0;
    }
  }, [status, batchStatus]);

  /**
   * Get the previous location from the session storage. If not available or split fails, fallback to the root.
   * @returns string - previous location URI or root
   */
  const getPreviousLocationData = React.useCallback(() => {
    try {
      const history = getSessionStorageItem('history')?.split(',') || [];
      return {
        pathname: history.length > 1 ? history.at(-2) : ROUTES.HOME,
        length: history.length,
      };
    } catch (_) {
      return {
        pathname: ROUTES.HOME,
        length: 1,
      };
    }
  }, []);

  const navigateBack = React.useCallback((): Promise<boolean> | void => {
    if (forceRouteToAlterations) {
      return router.push(ROUTES.ALTERATIONS);
    }
    if (forceRouteToApplicationId) {
      return router.push(
        `${ROUTES.APPLICATION}?id=${forceRouteToApplicationId}`
      );
    }

    const previousLocation = getPreviousLocationData().pathname;

    // When coming from the alteration page (open application in new window), return to the alteration page
    if (
      getPreviousLocationData().length === 1 &&
      document.referrer.includes(ROUTES.ALTERATIONS)
    ) {
      return router.push(ROUTES.ALTERATIONS);
    }

    if (isArchived) {
      // When looking matching applications, return to the archive with search params
      if (ROUTES.HOME && /\?appNo|&appNo/.test(previousLocation)) {
        return router.push(previousLocation);
      }

      // Otherwise just return to archive
      return router.push(ROUTES.APPLICATIONS_ARCHIVE);
    }

    const isApplicationView =
      router.pathname.includes(ROUTES.APPLICATION) && router.query?.id;

    if (isApplicationView) {
      return router.push(`/?tab=${statusToTabId()}`);
    }
    return router.push(previousLocation);
  }, [
    forceRouteToAlterations,
    router,
    forceRouteToApplicationId,
    getPreviousLocationData,
    isArchived,
    statusToTabId,
  ]);

  return {
    navigateBack,
  };
};
