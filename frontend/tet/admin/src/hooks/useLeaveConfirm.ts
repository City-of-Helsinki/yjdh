import { useEffect } from 'react';
import Router from 'next/router';
import { useTranslation } from 'next-i18next';
const useLeaveConfirm = (unsavedChanges: boolean) => {
  const { t } = useTranslation();
  const message = t('common:editor.leaveConfirm');

  useEffect(() => {
    const routeChangeStart = (url) => {
      if (Router.asPath !== url && unsavedChanges && !confirm(message)) {
        Router.events.emit('routeChangeError');
        throw 'Abort route change. Please ignore this error.';
      }
    };

    const beforeunload = (e) => {
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

export default useLeaveConfirm;
