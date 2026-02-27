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

const useLeaveConfirm = (unsavedChanges: boolean, message: string): void => {
  const { confirm } = useConfirm();
  const isRouterBypassed = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    const routeChangeStart = (url: string): void => {
      // eslint-disable-next-line no-alert
      if (Router.asPath !== url && unsavedChanges && !isRouterBypassed.current && !leaveConfirmStore.isBypassed) {
        Router.events.emit('routeChangeError');

        void confirm({
          header: message,
          submitButtonLabel: t('common:dialog.confirm'),
          submitButtonVariant: 'danger',
          content: t('common:application.buttons.leave_confirmation_description'),
        }).then((isConfirmed) => {
          if (isConfirmed) {
            isRouterBypassed.current = true;
            void Router.push(url);
          }
          return null;
        });

        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e: Event): string | null => {
      if (unsavedChanges && !isRouterBypassed.current && !leaveConfirmStore.isBypassed) {
        e.preventDefault();
        return message;
      }
      return null;
    };

    window.addEventListener('beforeunload', beforeunload);
    Router.events.on('routeChangeStart', routeChangeStart);

    return () => {
      leaveConfirmStore.isBypassed = false;
      window.removeEventListener('beforeunload', beforeunload);
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [message, unsavedChanges, confirm, t]);
};

export default useLeaveConfirm;
