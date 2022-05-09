import { useEffect } from 'react';
import Router from 'next/router';
const useLeaveConfirm = (unsavedChanges: boolean, message: string) => {
  useEffect(() => {
    const routeChangeStart = (url: string) => {
      if (Router.asPath !== url && unsavedChanges && !confirm(message)) {
        Router.events.emit('routeChangeError');
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e: Event) => {
      if (unsavedChanges) {
        e.preventDefault();
        return message;
      }
    };

    window.addEventListener('beforeunload', beforeunload);
    Router.events.on('routeChangeStart', routeChangeStart);

    return () => {
      window.removeEventListener('beforeunload', beforeunload);
      Router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [unsavedChanges]);
};

export default useLeaveConfirm;
