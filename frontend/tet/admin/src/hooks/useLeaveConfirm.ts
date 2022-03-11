import { useEffect } from 'react';
import Router from 'next/router';
const useWarnIfUnsavedChanges = (unsavedChanges: boolean) => {
  const message = 'Do you want to leave?';

  useEffect(() => {
    const routeChangeStart = (url) => {
      if (Router.asPath !== url && unsavedChanges && !confirm(message)) {
        Router.events.emit('routeChangeError');
        Router.replace(Router, Router.asPath, { shallow: true });
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e) => {
      console.log('beforeunload');
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
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

export default useWarnIfUnsavedChanges;
