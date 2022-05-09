import Router from 'next/router';
import { useEffect } from 'react';

const useLeaveConfirm = (unsavedChanges: boolean, message: string): void => {
  useEffect(() => {
    const routeChangeStart = (url: string): void => {
      // eslint-disable-next-line no-alert
      if (Router.asPath !== url && unsavedChanges && !window.confirm(message)) {
        Router.events.emit('routeChangeError');
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e: Event): string | null => {
      if (unsavedChanges) {
        e.preventDefault();
        return message;
      }
      return null;
    };

    window.addEventListener('beforeunload', beforeunload);
    Router.events.on('routeChangeStart', routeChangeStart);

    return () => {
      window.removeEventListener('beforeunload', beforeunload);
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [message, unsavedChanges]);
};

export default useLeaveConfirm;
